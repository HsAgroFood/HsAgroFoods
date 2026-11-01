import {
  Clock,
  CreditCard,
  FlaskConical,
  Gift,
  Heart,
  HelpCircle,
  Leaf,
  MapPin,
  Package,
  Percent,
  Phone,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Truck,
  type LucideIcon,
} from 'lucide-react'

/** Icons an admin can pick for a global FAQ. The key is what is stored in global_faqs.icon. */
export const FAQ_ICONS: Record<string, { label: string; Icon: LucideIcon }> = {
  truck: { label: 'Delivery', Icon: Truck },
  'credit-card': { label: 'Payment', Icon: CreditCard },
  'shield-check': { label: 'Quality / FSSAI', Icon: ShieldCheck },
  store: { label: 'Bulk / Wholesale', Icon: Store },
  refund: { label: 'Returns / Refund', Icon: RotateCcw },
  leaf: { label: 'Natural', Icon: Leaf },
  package: { label: 'Packaging / Storage', Icon: Package },
  flask: { label: 'Lab tested', Icon: FlaskConical },
  percent: { label: 'Offers', Icon: Percent },
  gift: { label: 'Gifting', Icon: Gift },
  heart: { label: 'Health', Icon: Heart },
  star: { label: 'Reviews', Icon: Star },
  'map-pin': { label: 'Location', Icon: MapPin },
  phone: { label: 'Contact', Icon: Phone },
  clock: { label: 'Timing', Icon: Clock },
  sparkles: { label: 'Special', Icon: Sparkles },
  help: { label: 'General', Icon: HelpCircle },
}

export const FAQ_ICON_KEYS = Object.keys(FAQ_ICONS)

/** Normalises form input: a known key is kept, anything else (including "Auto") becomes null. */
export function cleanFaqIcon(value: unknown): string | null {
  return typeof value === 'string' && value in FAQ_ICONS ? value : null
}

/** The chosen icon, or a best guess from the question text when the admin left it on Auto. */
export function resolveFaqIcon(icon: string | null | undefined, question: string): LucideIcon {
  if (icon && icon in FAQ_ICONS) return FAQ_ICONS[icon].Icon

  const q = question.toLowerCase()
  if (/deliver|ship|dispatch|track/.test(q)) return Truck
  if (/pay|cod|cash|upi|card/.test(q)) return CreditCard
  if (/fssai|lab|certif|tested|quality/.test(q)) return ShieldCheck
  if (/bulk|wholesale|restaurant|b2b/.test(q)) return Store
  if (/return|refund|replace|damage|wrong/.test(q)) return RotateCcw
  if (/natural|pure|preservative|chemical/.test(q)) return Leaf
  if (/store|storage|shelf|pack/.test(q)) return Package
  return HelpCircle
}
