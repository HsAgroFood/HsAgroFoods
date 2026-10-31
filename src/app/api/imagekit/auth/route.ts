import { imagekit } from '@/lib/imagekit'
import { isAdminAuthenticated } from '@/lib/adminAuth'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const hasAdminSession = await isAdminAuthenticated()

  if (!hasAdminSession) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const authenticationParameters = imagekit.getAuthenticationParameters()
    return NextResponse.json(authenticationParameters)
  } catch (error) {
    console.error('Error generating ImageKit auth parameters:', error)
    return NextResponse.json(
      { error: 'Failed to generate ImageKit authentication parameters' },
      { status: 500 }
    )
  }
}
