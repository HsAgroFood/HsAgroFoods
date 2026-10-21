import crypto from 'crypto'
import { cookies } from 'next/headers'
import { createClient } from './supabase/server'
import { createAdminClient } from './supabase/admin'

export type AuthUser = {
  id: string
  email: string
  full_name: string
  role: string
  phone?: string
}

const JWT_SECRET =
  process.env.AUTH_SECRET ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'jaandaar-masale-super-secret-jwt-signing-key-32'

// Helper: base64url encoding / decoding
function base64urlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function base64urlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) {
    str += '='
  }
  return Buffer.from(str, 'base64').toString('utf-8')
}

// 1. Password Hashing with PBKDF2 (SHA-512)
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash) return false
  if (storedHash.includes(':')) {
    const [salt, originalHash] = storedHash.split(':')
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(originalHash))
  }
  return storedHash === password
}

// 2. Standard JWT Creation (Header.Payload.Signature)
export function createJwtToken(user: AuthUser): string {
  const header = JSON.stringify({ alg: 'HS256', typ: 'JWT' })
  const payload = JSON.stringify({
    sub: user.id,
    id: user.id,
    email: user.email.toLowerCase(),
    full_name: user.full_name,
    role: user.role || 'customer',
    phone: user.phone || '',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
  })

  const encodedHeader = base64urlEncode(header)
  const encodedPayload = base64urlEncode(payload)
  const dataToSign = `${encodedHeader}.${encodedPayload}`

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(dataToSign)
    .digest('base64url')

  return `${dataToSign}.${signature}`
}

// 3. JWT Verification
export function verifyJwtToken(token: string): AuthUser | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const [encodedHeader, encodedPayload, signature] = parts
    const dataToSign = `${encodedHeader}.${encodedPayload}`

    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(dataToSign)
      .digest('base64url')

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null
    }

    const payload = JSON.parse(base64urlDecode(encodedPayload))

    // Check expiry
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return null
    }

    return {
      id: payload.id || payload.sub,
      email: payload.email,
      full_name: payload.full_name,
      role: payload.role || 'customer',
      phone: payload.phone || '',
    }
  } catch {
    return null
  }
}

// 4. Session Cookie Management
export async function setUserSession(user: AuthUser) {
  const token = createJwtToken(user)
  const cookieStore = await cookies()
  cookieStore.set('user_session', token, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
}

export async function clearUserSession() {
  const cookieStore = await cookies()
  cookieStore.delete('user_session')
}

// 5. Get Authenticated User from JWT Cookie
export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('user_session')
    if (!sessionCookie?.value) return null

    const verified = verifyJwtToken(sessionCookie.value)
    if (!verified) return null

    return verified
  } catch {
    return null
  }
}

// 6. Unified Effective User Resolver (Checks JWT first, fallback to Supabase Auth)
export async function getEffectiveUser(): Promise<AuthUser | null> {
  // 1. Direct JWT session
  const directUser = await getAuthUser()
  if (directUser) {
    try {
      const adminClient = createAdminClient()
      const { data: account } = await adminClient
        .from('users')
        .select('is_active')
        .eq('id', directUser.id)
        .maybeSingle()

      if (account && account.is_active === false) {
        return null
      }
    } catch {
      // Ignore lookup failure and keep the signed session
    }

    return directUser
  }

  // 2. Supabase Auth fallback
  try {
    const supabase = await createClient()
    const {
      data: { user: sbUser },
    } = await supabase.auth.getUser()

    if (sbUser) {
      const adminClient = createAdminClient()
      const { data: profile } = await adminClient
        .from('profiles')
        .select('full_name, email, role, phone, is_active')
        .eq('id', sbUser.id)
        .maybeSingle()

      if (profile && profile.is_active === false) {
        return null
      }

      return {
        id: sbUser.id,
        email: sbUser.email || '',
        full_name: profile?.full_name || sbUser.user_metadata?.full_name || 'Customer',
        role: profile?.role || sbUser.user_metadata?.role || 'customer',
        phone: profile?.phone || '',
      }
    }
  } catch {
    // Ignore
  }

  return null
}
