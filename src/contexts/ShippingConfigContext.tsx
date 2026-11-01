'use client'

import { createContext, useContext, ReactNode } from 'react'
import type { ShippingConfig } from '@/actions/shipping'

// Real values are always supplied by ShippingConfigProvider (loaded from the DB in the
// storefront layout), so the context has no hardcoded defaults of its own.
const ShippingConfigContext = createContext<ShippingConfig | null>(null)

export function ShippingConfigProvider({
  config,
  children,
}: {
  config: ShippingConfig
  children: ReactNode
}) {
  return <ShippingConfigContext.Provider value={config}>{children}</ShippingConfigContext.Provider>
}

export function useShippingConfig(): ShippingConfig {
  const config = useContext(ShippingConfigContext)
  if (!config) {
    throw new Error('useShippingConfig must be used inside ShippingConfigProvider')
  }
  return config
}
