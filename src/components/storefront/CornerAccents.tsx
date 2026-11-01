'use client'

import { createContext, useContext } from 'react'
import Image, { type ImageProps } from 'next/image'
import { HOME_DEFAULTS } from '@/lib/homeContent'

export type CornerAccentUrls = typeof HOME_DEFAULTS.accents
export type CornerAccentKind = 'leaves' | 'chillies' | 'promiseLeft' | 'promiseRight' | 'newsletterLeft' | 'newsletterRight'

const KIND_TO_KEY: Record<CornerAccentKind, keyof CornerAccentUrls> = {
  leaves: 'leavesImage',
  chillies: 'chilliesImage',
  promiseLeft: 'promiseLeftImage',
  promiseRight: 'promiseRightImage',
  newsletterLeft: 'newsletterLeftImage',
  newsletterRight: 'newsletterRightImage',
}

// Pages outside the provider still get the built-in artwork
const CornerAccentsContext = createContext<CornerAccentUrls>(HOME_DEFAULTS.accents)

export function CornerAccentsProvider({ accents, children }: { accents: CornerAccentUrls; children: React.ReactNode }) {
  return <CornerAccentsContext.Provider value={accents}>{children}</CornerAccentsContext.Provider>
}

/** A decorative corner image whose artwork the admin can change (Home Customization > Corner Images). */
export function CornerAccentImage({ kind, alt = '', ...props }: Omit<ImageProps, 'src' | 'alt'> & { kind: CornerAccentKind; alt?: string }) {
  const accents = useContext(CornerAccentsContext)
  return <Image src={accents[KIND_TO_KEY[kind]]} alt={alt} {...props} />
}
