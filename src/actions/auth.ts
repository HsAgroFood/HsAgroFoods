'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { hashPassword, verifyPassword, setUserSession, clearUserSession, getAuthUser, AuthUser } from '@/lib/userAuth'
import { sendSignupOtpEmail, sendPasswordResetEmail } from '@/lib/brevo'
import { createAdminSessionValue } from '@/lib/adminSession'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import crypto from 'crypto'

export type AuthResult = {
  error?: string
  success?: boolean
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

// =============================================================
// 1. DIRECT DATABASE REGISTRATION (Instant Signup in DB)
// =============================================================
export async function customerDirectRegister(
  _prevState: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const fullName = (formData.get('full_name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string
  const redirectTo = (formData.get('redirectTo') as string) || '/'

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

  // 1. Check if user already exists in `users` table or `profiles` table
  const { data: existingUser } = await adminClient
    .from('users')
    .select('id, email')
    .ilike('email', email)
    .maybeSingle()

  if (existingUser) {
    return { error: 'An account with this email already exists. Please sign in.' }
  }

  const { data: existingProfile } = await adminClient
    .from('profiles')
    .select('id, email')
    .ilike('email', email)
    .maybeSingle()

  if (existingProfile) {
    return { error: 'An account with this email already exists. Please sign in.' }
  }

  // 2. Hash password securely
  const passwordHash = hashPassword(password)
  const userId = crypto.randomUUID()

  // 3. Insert into `users` table
  let insertSuccess = false
  const { error: userInsertError } = await adminClient.from('users').insert([
    {
      id: userId,
      full_name: fullName,
      email,
      password_hash: passwordHash,
      role: 'customer',
      phone: '',
      is_active: true,
    },
  ])

  if (!userInsertError) {
    insertSuccess = true
  }

  // Also sync to `profiles` table
  await adminClient.from('profiles').upsert([
    {
      id: userId,
      full_name: fullName,
      email,
      password_hash: passwordHash,
      role: 'customer',
      phone: '',
      is_active: true,
    },
  ])

  if (!insertSuccess && userInsertError) {
    console.error('Failed to insert into users table:', userInsertError)
    // If table `users` hasn't been created yet, profile table was upserted above
  }

  // 4. Set direct session cookie
  const authUser: AuthUser = {
    id: userId,
    email,
    full_name: fullName,
    role: 'customer',
  }

  await setUserSession(authUser)
  await mergeGuestCart(userId)

  revalidatePath('/', 'layout')
  redirect(redirectTo)
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
// 3. SIGN UP FLOW WITH OTP (Brevo Verification Option)
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

  // Check if account already exists
  const { data: existingUser } = await adminClient
    .from('users')
    .select('id')
    .ilike('email', email)
    .maybeSingle()

  if (existingUser) {
    return { error: 'An account with this email already exists. Please sign in.' }
  }

  // Generate 6-digit numeric OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
  const passwordHash = hashPassword(password)
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  // Clean up old OTP records
  await adminClient.from('auth_signup_otps').delete().ilike('email', email)

  // Insert temporary record
  await adminClient.from('auth_signup_otps').insert([
    {
      email,
      full_name: fullName,
      encrypted_password: passwordHash,
      otp_code: otpCode,
      expires_at: expiresAt,
      verified: false,
    },
  ])

  // Dispatch OTP email via Brevo
  const emailRes = await sendSignupOtpEmail({
    email,
    name: fullName,
    otp: otpCode,
  })

  if (!emailRes.success && !emailRes.simulated) {
    return { error: emailRes.error || 'Failed to send verification email. Please check your address.' }
  }

  return { success: true }
}

export async function verifySignupOtp(
  _prevState: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const token = (formData.get('token') as string)?.trim()
  const redirectTo = (formData.get('redirectTo') as string) || '/'

  if (!email || !token) {
    return { error: 'Email and 6-digit verification code are required.' }
  }

  const adminClient = createAdminClient()

  // Fetch pending OTP record
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

  // Check expiry
  if (new Date(record.expires_at) < new Date()) {
    return { error: 'Verification code has expired. Please request a new code.' }
  }

  // Check code match
  if (record.otp_code !== token) {
    await adminClient
      .from('auth_signup_otps')
      .update({ attempts: (record.attempts || 0) + 1 })
      .eq('id', record.id)

    return { error: 'Invalid verification code. Please enter the 6-digit code sent to your email.' }
  }

  // Store user in direct `users` table
  const userId = crypto.randomUUID()
  const passwordHash = record.encrypted_password

  await adminClient.from('users').insert([
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

  // Clean OTP record
  await adminClient.from('auth_signup_otps').delete().eq('id', record.id)

  // Direct Session Login
  const authUser: AuthUser = {
    id: userId,
    email: record.email,
    full_name: record.full_name,
    role: 'customer',
  }

  await setUserSession(authUser)
  await mergeGuestCart(userId)

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

  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const resetUrl = `${origin}/reset-password?token=${resetToken}`

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
