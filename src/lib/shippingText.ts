import type { ShippingConfig } from '@/actions/shipping'

/**
 * Display copy derived from the DB shipping config. A threshold of 0 (or a 0 standard fee)
 * means delivery is free on every order, so "above ₹0" style wording is never shown.
 */
export function shippingCopy(config: ShippingConfig) {
  const t = config.free_shipping_threshold
  const freeForAll = t <= 0 || config.standard_shipping_cost <= 0

  return {
    freeForAll,
    /** "Free Shipping Across India Above ₹499" */
    acrossIndia: freeForAll ? 'Free Shipping Across India on All Orders' : `Free Shipping Across India Above ₹${t}`,
    /** "Free Delivery > ₹499" */
    deliveryShort: freeForAll ? 'Free Delivery on All Orders' : `Free Delivery > ₹${t}`,
    /** "Free Delivery Above ₹499" */
    deliveryAbove: freeForAll ? 'Free Delivery on All Orders' : `Free Delivery Above ₹${t}`,
    /** "on orders above ₹499" */
    ordersAbove: freeForAll ? 'on all orders' : `on orders above ₹${t}`,
    /** Stat tile: big value + caption */
    statValue: freeForAll ? 'FREE' : `₹${t}+`,
    statLabel: freeForAll ? 'Shipping on All Orders' : 'Free Shipping',
    /** Terms page */
    termsTitle: freeForAll ? 'Free Shipping on All Orders' : `Free Shipping ₹${t}+`,
    termsSentence: freeForAll ? 'Free shipping on all orders.' : `Free shipping on ₹${t}+ orders.`,
  }
}
