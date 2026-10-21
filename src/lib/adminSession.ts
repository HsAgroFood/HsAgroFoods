const SECRET =
  process.env.AUTH_SECRET ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'jaandaar-masale-admin-session-secret-key'

const MAX_AGE_SECONDS = 60 * 60 * 24 * 7

const encoder = new TextEncoder()

function toBase64Url(input: string | Uint8Array): string {
  const bytes = typeof input === 'string' ? encoder.encode(input) : input
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (value.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(new ArrayBuffer(binary.length))
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

async function getKey(): Promise<any> {
  return globalThis.crypto.subtle.importKey(
    'raw',
    encoder.encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

export async function createAdminSessionValue(): Promise<string> {
  const payload = JSON.stringify({
    role: 'admin',
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS,
  })
  const encoded = toBase64Url(payload)
  const key = await getKey()
  const signature = await globalThis.crypto.subtle.sign('HMAC', key, encoder.encode(encoded))
  return `${encoded}.${toBase64Url(new Uint8Array(signature))}`
}

export async function verifyAdminSessionValue(value?: string | null): Promise<boolean> {
  if (!value) return false

  const [encoded, signature] = value.split('.')
  if (!encoded || !signature) return false

  try {
    const key = await getKey()
    const valid = await globalThis.crypto.subtle.verify(
      'HMAC',
      key,
      fromBase64Url(signature),
      encoder.encode(encoded)
    )

    if (!valid) return false

    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(encoded)))
    return (
      payload?.role === 'admin' &&
      typeof payload.exp === 'number' &&
      payload.exp > Math.floor(Date.now() / 1000)
    )
  } catch {
    return false
  }
}
