import ImageKit from 'imagekit'

let imagekitInstance: ImageKit | null = null

export function getImageKit(): ImageKit {
  if (!imagekitInstance) {
    const publicKey =
      process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY ||
      process.env.IMAGEKIT_PUBLIC_KEY ||
      'dummy_public_key'
    const privateKey =
      process.env.IMAGEKIT_PRIVATE_KEY ||
      'dummy_private_key'
    const urlEndpoint =
      process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ||
      process.env.IMAGEKIT_URL_ENDPOINT ||
      'https://ik.imagekit.io/dummy'

    imagekitInstance = new ImageKit({
      publicKey,
      privateKey,
      urlEndpoint,
    })
  }

  return imagekitInstance
}

// Lazy proxy so importing imagekit does not fail at module evaluation
export const imagekit = new Proxy({} as ImageKit, {
  get(_target, prop) {
    const instance = getImageKit()
    const val = (instance as any)[prop]
    return typeof val === 'function' ? val.bind(instance) : val
  },
})

export function getImageKitAuth() {
  return getImageKit().getAuthenticationParameters()
}
