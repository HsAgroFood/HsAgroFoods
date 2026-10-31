'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { hashPassword, verifyPassword, setUserSession, clearUserSession, getAuthUser, AuthUser } from '@/lib/userAuth'
import { sendSignupOtpEmail, sendLoginOtpEmail, sendPasswordResetEmail } from '@/lib/brevo'
import { createAdminSessionValue } from '@/lib/adminSession'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import crypto from 'crypto'

export type AuthResult = {
  error?: string
  success?: boolean
  /** Seconds until another OTP may be requested */
  retryAfter?: number
}

// -------------------------------------------------------------
// Cart Helper: Merge Guest Cart upon Login / Signup
// -------------------------------------------------------------
async function mergeGuestCart(userId: string) {
  const cookieStore = await cookies()
  const guestCartCookie = cookieStore.get('guest_cart')
  if (!guestCartCookie) return

  try {
    const guestCart = JSON.parse(guestCartCookie.value) as { variant_id: string; quantity: number }[]
    if (!guestCart || guestCart.length === 0) return

    const adminClient = createAdminClient()

    for (const item of guestCart) {
      const { data: existing } = await adminClient
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', userId)
        .eq('variant_id', item.variant_id)
        .maybeSingle()

      if (existing) {
        await adminClient
          .from('cart_items')
          .update({ quantity: existing.quantity + item.quantity })
          .eq('id', existing.id)
      } else {
        await adminClient
          .from('cart_items')
          .insert([{ user_id: userId, variant_id: item.variant_id, quantity: item.quantity }])
      }
    }

    // Clear the guest cart cookie
    cookieStore.delete('guest_cart')
  } catch (err) {
    console.error('Failed to merge guest cart:', err)
  }
}

// -------------------------------------------------------------
// OTP / Link Helpers
// -------------------------------------------------------------
const OTP_TTL_MS = 10 * 60 * 1000 // OTP valid for 10 minutes
const OTP_RESEND_COOLDOWN_SEC = 60 // resend allowed 60s after the last send
const OTP_MAX_ATTEMPTS = 5

function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString()
}

function resendWaitSeconds(createdAt?: string | null) {
  if (!createdAt) return 0
  const elapsed = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000)
  return Math.max(0, OTP_RESEND_COOLDOWN_SEC - elapsed)
}

function safeRedirectPath(path: string | null | undefined) {
  return path && path.startsWith('/') && !path.startsWith('//') ? path : '/'
}

function getSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, '')
  if (fromEnv) return fromEnv
  return process.env.NODE_ENV === 'production' ? 'https://www.hsagrofoods.com' : 'http://localhost:3000'
}

async function findAccountByEmail(email: string) {
  const adminClient = createAdminClient()
  const { data: userRecord } = await adminClient
    .from('users')
    .select('id, full_name, email, role, is_active')
    .ilike('email', email)
    .maybeSingle()
  if (userRecord) return userRecord

  const { data: profileRecord } = await adminClient
    .from('profiles')
    .select('id, full_name, email, role, is_active')
    .ilike('email', email)
    .maybeSingle()
  return profileRecord
}

// =============================================================
// 2. DIRECT DATABASE LOGIN (Email + Password against DB Table)
// =============================================================
export async function customerPasswordLogin(
  _prevState: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string
  const redirectTo = (formData.get('redirectTo') as string) || '/'

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const adminClient = createAdminClient()

  // 1. Look up user in `users` table
  let foundUser: any = null
  const { data: userRecord } = await adminClient
    .from('users')
    .select('id, full_name, email, password_hash, role, is_active')
    .ilike('email', email)
    .maybeSingle()

  if (userRecord) {
    foundUser = userRecord
  } else {
    // Fallback: check `profiles` table
    const { data: profileRecord } = await adminClient
      .from('profiles')
      .select('id, full_name, email, password_hash, role, is_active')
      .ilike('email', email)
      .maybeSingle()

    if (profileRecord) {
      foundUser = profileRecord
    }
  }

  // 2. If user not found in DB
  if (!foundUser) {
    return { error: 'No account found with this email address. Please register.' }
  }

  if (foundUser.is_active === false) {
    return { error: 'This account has been deactivated. Please contact support.' }
  }

  // 3. Verify password
  let isValidPassword = false
  if (foundUser.password_hash) {
    isValidPassword = verifyPassword(password, foundUser.password_hash)
  }

  if (!isValidPassword) {
    return { error: 'Incorrect password. Please try again.' }
  }

  // 4. Set direct session cookie
  const authUser: AuthUser = {
    id: foundUser.id,
    email: foundUser.email,
    full_name: foundUser.full_name || 'Customer',
    role: foundUser.role || 'customer',
  }

  await setUserSession(authUser)
  await mergeGuestCart(foundUser.id)

  revalidatePath('/', 'layout')
  redirect(redirectTo)
}

// =============================================================
// 3. SIGN UP FLOW WITH EMAIL OTP (Brevo)
//    OTP valid 10 min · resend allowed after 60 sec
// =============================================================
export async function requestSignupOtp(
  _prevState: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const fullName = (formData.get('full_name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string

  if (!fullName || !email || !password) {
    return { error: 'Full name, email and password are all required.' }
  }

  if (fullName.length < 2) {
    return { error: 'Please enter a valid full name (at least 2 characters).' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { error: 'Please provide a valid email address.' }
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters long.' }
  }

  const adminClient = createAdminClient()

  // Account already exists?
  if (await findAccountByEmail(email)) {
    return { error: 'An account with this email already exists. Please sign in.' }
  }

  // 60-second resend cooldown
  const { data: lastOtp } = await adminClient
    .from('auth_signup_otps')
    .select('created_at')
    .ilike('email', email)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const wait = resendWaitSeconds(lastOtp?.created_at)
  if (wait > 0) {
    return { error: `Please wait ${wait}s before requesting a new code.`, retryAfter: wait }
  }

  const otpCode = generateOtp()
  const passwordHash = hashPassword(password)
  const expiresAt = new Date(Date.now() + OTP_TTL_MS).toISOString()

  await adminClient.from('auth_signup_otps').delete().ilike('email', email)

  const { error: insertError } = await adminClient.from('auth_signup_otps').insert([
    {
      email,
      full_name: fullName,
      encrypted_password: passwordHash,
      otp_code: otpCode,
      expires_at: expiresAt,
      verified: false,
    },
  ])

  if (insertError) {
    console.error('Failed to store signup OTP:', insertError)
    return { error: 'Could not start verification. Please try again.' }
  }

  const emailRes = await sendSignupOtpEmail({ email, name: fullName, otp: otpCode })

  if (!emailRes.success && !emailRes.simulated) {
    await adminClient.from('auth_signup_otps').delete().ilike('email', email)
    return { error: emailRes.error || 'Failed to send verification email. Please check your address.' }
  }

  return { success: true, retryAfter: OTP_RESEND_COOLDOWN_SEC }
}

export async function verifySignupOtp(
  _prevState: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const token = (formData.get('token') as string)?.trim()
  const redirectTo = safeRedirectPath(formData.get('redirectTo') as string)

  if (!email || !token) {
    return { error: 'Email and 6-digit verification code are required.' }
  }

  const adminClient = createAdminClient()

  const { data: record, error: fetchError } = await adminClient
    .from('auth_signup_otps')
    .select('*')
    .ilike('email', email)
    .eq('verified', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (fetchError || !record) {
    return { error: 'No pending registration found. Please request a new verification code.' }
  }

  if ((record.attempts || 0) >= OTP_MAX_ATTEMPTS) {
    await adminClient.from('auth_signup_otps').delete().eq('id', record.id)
    return { error: 'Too many incorrect attempts. Please request a new code.' }
  }

  if (new Date(record.expires_at) < new Date()) {
    return { error: 'Verification code has expired. Please request a new code.' }
  }

  if (record.otp_code !== token) {
    await adminClient
      .from('auth_signup_otps')
      .update({ attempts: (record.attempts || 0) + 1 })
      .eq('id', record.id)

    return { error: 'Invalid verification code. Please enter the 6-digit code sent to your email.' }
  }

  // Guard against a parallel signup having created the account meanwhile
  if (await findAccountByEmail(record.email)) {
    await adminClient.from('auth_signup_otps').delete().eq('id', record.id)
    return { error: 'An account with this email already exists. Please sign in.' }
  }

  const userId = crypto.randomUUID()
  const passwordHash = record.encrypted_password

  const { error: userInsertError } = await adminClient.from('users').insert([
    {
      id: userId,
      full_name: record.full_name,
      email: record.email,
      password_hash: passwordHash,
      role: 'customer',
      phone: '',
      is_active: true,
    },
  ])

  if (userInsertError) {
    console.error('Failed to create user after OTP verification:', userInsertError)
    return { error: 'Could not create your account. Please try again.' }
  }

  await adminClient.from('profiles').upsert([
    {
      id: userId,
      full_name: record.full_name,
      email: record.email,
      password_hash: passwordHash,
      role: 'customer',
      phone: '',
      is_active: true,
    },
  ])

  await adminClient.from('auth_signup_otps').delete().eq('id', record.id)

  await setUserSession({
    id: userId,
    email: record.email,
    full_name: record.full_name,
    role: 'customer',
  })
  await mergeGuestCart(userId)

  revalidatePath('/', 'layout')
  redirect(redirectTo)
}

// =============================================================
// 3b. LOGIN WITH EMAIL OTP (existing accounts only)
//     OTP valid 10 min · resend allowed after 60 sec
// =============================================================
export async function requestLoginOtp(
  _prevState: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const email = (formData.get('email') as string)?.trim().toLowerCase()

  if (!email) {
    return { error: 'Please enter your registered email address.' }
  }

  const account = await findAccountByEmail(email)

  if (!account) {
    return { error: 'No account found with this email. Please create an account first.' }
  }

  if (account.is_active === false) {
    return { error: 'This account has been deactivated. Please contact support.' }
  }

  const adminClient = createAdminClient()

  const { data: lastOtp } = await adminClient
    .from('auth_login_otps')
    .select('created_at')
    .ilike('email', email)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const wait = resendWaitSeconds(lastOtp?.created_at)
  if (wait > 0) {
    return { error: `Please wait ${wait}s before requesting a new code.`, retryAfter: wait }
  }

  const otpCode = generateOtp()
  const expiresAt = new Date(Date.now() + OTP_TTL_MS).toISOString()

  await adminClient.from('auth_login_otps').delete().ilike('email', email)

  const { error: insertError } = await adminClient.from('auth_login_otps').insert([
    { email, otp_code: otpCode, expires_at: expiresAt },
  ])

  if (insertError) {
    console.error('Failed to store login OTP:', insertError)
    return { error: 'Could not send a login code. Please try again.' }
  }

  const emailRes = await sendLoginOtpEmail({
    email,
    name: account.full_name || 'Customer',
    otp: otpCode,
  })

  if (!emailRes.success && !emailRes.simulated) {
    await adminClient.from('auth_login_otps').delete().ilike('email', email)
    return { error: emailRes.error || 'Failed to send login code. Please try again.' }
  }

  return { success: true, retryAfter: OTP_RESEND_COOLDOWN_SEC }
}

export async function verifyLoginOtp(
  _prevState: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const token = (formData.get('token') as string)?.trim()
  const redirectTo = safeRedirectPath(formData.get('redirectTo') as string)

  if (!email || !token) {
    return { error: 'Email and 6-digit login code are required.' }
  }

  const adminClient = createAdminClient()

  const { data: record } = await adminClient
    .from('auth_login_otps')
    .select('*')
    .ilike('email', email)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!record) {
    return { error: 'No login code found. Please request a new code.' }
  }

  if ((record.attempts || 0) >= OTP_MAX_ATTEMPTS) {
    await adminClient.from('auth_login_otps').delete().eq('id', record.id)
    return { error: 'Too many incorrect attempts. Please request a new code.' }
  }

  if (new Date(record.expires_at) < new Date()) {
    return { error: 'Login code has expired. Please request a new code.' }
  }

  if (record.otp_code !== token) {
    await adminClient
      .from('auth_login_otps')
      .update({ attempts: (record.attempts || 0) + 1 })
      .eq('id', record.id)

    return { error: 'Invalid login code. Please enter the 6-digit code sent to your email.' }
  }

  const account = await findAccountByEmail(email)

  if (!account) {
    return { error: 'No account found with this email. Please create an account first.' }
  }

  if (account.is_active === false) {
    return { error: 'This account has been deactivated. Please contact support.' }
  }

  // One-time use
  await adminClient.from('auth_login_otps').delete().eq('id', record.id)

  await setUserSession({
    id: account.id,
    email: account.email,
    full_name: account.full_name || 'Customer',
    role: account.role || 'customer',
  })
  await mergeGuestCart(account.id)

  revalidatePath('/', 'layout')
  redirect(redirectTo)
}

// =============================================================
// 4. FORGOT & RESET PASSWORD (Direct DB Table)
// =============================================================
export async function requestPasswordReset(
  _prevState: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const email = (formData.get('email') as string)?.trim().toLowerCase()

  if (!email) {
    return { error: 'Please provide your account email address.' }
  }

  const adminClient = createAdminClient()

  // Verify account exists in users or profiles
  let profile: any = null
  const { data: u } = await adminClient.from('users').select('id, full_name, email').ilike('email', email).maybeSingle()
  if (u) {
    profile = u
  } else {
    const { data: p } = await adminClient.from('profiles').select('id, full_name, email').ilike('email', email).maybeSingle()
    profile = p
  }

  if (!profile) {
    return { error: 'No account registered with this email address.' }
  }

  // Generate 64-char crypto token
  const resetToken = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

  await adminClient.from('password_reset_tokens').delete().ilike('email', email)
  await adminClient.from('password_reset_tokens').insert([
    {
      email,
      token: resetToken,
      used: false,
      expires_at: expiresAt,
    },
  ])

  const resetUrl = `${getSiteUrl()}/reset-password?token=${resetToken}`

  const emailRes = await sendPasswordResetEmail({
    email,
    name: profile.full_name,
    resetUrl,
  })

  if (!emailRes.success && !emailRes.simulated) {
    return { error: emailRes.error || 'Failed to send password reset email.' }
  }

  return { success: true }
}

export async function resetPasswordWithToken(
  _prevState: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const token = (formData.get('token') as string)?.trim()
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (!token) {
    return { error: 'Invalid or missing password reset token.' }
  }

  if (!password || !confirmPassword) {
    return { error: 'Please enter and confirm your new password.' }
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters long.' }
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match. Please verify and try again.' }
  }

  const adminClient = createAdminClient()

  // Validate token
  const { data: tokenRecord } = await adminClient
    .from('password_reset_tokens')
    .select('*')
    .eq('token', token)
    .eq('used', false)
    .maybeSingle()

  if (!tokenRecord) {
    return { error: 'This password reset link is invalid or has already been used.' }
  }

  if (new Date(tokenRecord.expires_at) < new Date()) {
    return { error: 'This password reset link has expired. Please request a new one.' }
  }

  const newHash = hashPassword(password)

  // Update password in users and profiles tables
  await adminClient.from('users').update({ password_hash: newHash }).ilike('email', tokenRecord.email)
  await adminClient.from('profiles').update({ password_hash: newHash }).ilike('email', tokenRecord.email)

  // Mark token used
  await adminClient.from('password_reset_tokens').update({ used: true }).eq('id', tokenRecord.id)

  // Fetch updated user to auto login
  const { data: user } = await adminClient.from('users').select('*').ilike('email', tokenRecord.email).maybeSingle()

  if (user) {
    await setUserSession({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    })
  }

  revalidatePath('/', 'layout')
  redirect('/account')
}

// =============================================================
// 5. ADMIN LOGIN & LOGOUT
// =============================================================
export async function adminLogin(
  _prevState: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const defaultAdminEmail = (process.env.ADMIN_EMAIL || 'admin@hsagrofoods.com').trim().toLowerCase()
  const defaultAdminPassword = process.env.ADMIN_PASSWORD || 'admin@123'

  const isDefaultAdmin = email === defaultAdminEmail && password === defaultAdminPassword

  if (isDefaultAdmin) {
    const cookieStore = await cookies()
    cookieStore.set('admin_session', await createAdminSessionValue(), {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    revalidatePath('/admin', 'layout')
    redirect('/admin')
  }

  // Check admin user in DB
  const adminClient = createAdminClient()
  const { data: dbAdmin } = await adminClient
    .from('users')
    .select('*')
    .ilike('email', email)
    .eq('role', 'admin')
    .maybeSingle()

  if (
    dbAdmin &&
    dbAdmin.is_active !== false &&
    dbAdmin.password_hash &&
    verifyPassword(password, dbAdmin.password_hash)
  ) {
    const cookieStore = await cookies()
    cookieStore.set('admin_session', await createAdminSessionValue(), {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })
    revalidatePath('/admin', 'layout')
    redirect('/admin')
  }

  return { error: 'Invalid admin email or password' }
}

export async function logout() {
  await clearUserSession()
  try {
    const cookieStore = await cookies()
    cookieStore.delete('admin_session')
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch {}
  revalidatePath('/', 'layout')
  redirect('/login')
}

export const sendOtp = requestSignupOtp
export const verifyOtp = verifySignupOtp
