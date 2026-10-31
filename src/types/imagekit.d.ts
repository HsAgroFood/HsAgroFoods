declare module 'imagekit' {
  interface ImageKitOptions {
    publicKey: string
    privateKey: string
    urlEndpoint: string
  }

  interface AuthenticationParameters {
    token: string
    expire: number
    signature: string
  }

  interface UploadOptions {
    file: string | Buffer
    fileName: string
    folder?: string
    isPrivateFile?: boolean
    useUniqueFileName?: boolean
    responseFields?: string[]
    tags?: string[]
    [key: string]: unknown
  }

  interface UploadResponse {
    fileId: string
    name: string
    size: number
    filePath: string
    url: string
    fileType: string
    height?: number
    width?: number
    thumbnailUrl?: string
    [key: string]: unknown
  }

  export default class ImageKit {
    constructor(options: ImageKitOptions)
    getAuthenticationParameters(token?: string, expire?: number): AuthenticationParameters
    upload(
      options: UploadOptions,
      callback?: (error: Error | null, result: UploadResponse | null) => void
    ): Promise<UploadResponse>
    [key: string]: unknown
  }
}

