import {
  Flower2,
  FolderTree,
  HelpCircle,
  Image as ImageIcon,
  Images,
  LayoutTemplate,
  Mail,
  Clapperboard,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  type LucideIcon,
} from 'lucide-react'
import type { HomeSectionKey } from '@/lib/homeContent'

/** Friendly names for the fields the admin form generates from the content defaults. */
const LABELS: Record<string, string> = {
  badge: 'Small badge text',
  eyebrow: 'Small line above the heading',
  label: 'Text',
  titleFirst: 'Heading (first part)',
  titleHighlight: 'Heading (orange part)',
  titleLine1: 'Heading line 1',
  titleLine2: 'Heading line 2',
  line1: 'Heading line 1',
  line2: 'Heading line 2',
  line2First: 'Heading line 2 (first part)',
  line2Highlight: 'Heading line 2 (orange part)',
  title: 'Title',
  subtitle: 'Subtitle',
  paragraph: 'Paragraph',
  description: 'Description',
  desc: 'Description',
  detail: 'Description',
  caption: 'Caption (shown on the image)',
  alt: 'Image description (for Google and screen readers)',
  src: 'Image',
  image: 'Photo',
  tag: 'Tagline (shown on hover)',
  cta: 'Button text (shown on hover)',
  href: 'Opens when clicked',
  buttonText: 'Button text',
  buttonLink: 'Button opens',
  primaryText: 'Main button text',
  primaryLink: 'Main button opens',
  secondaryText: 'Second button text',
  secondaryLink: 'Second button opens',
  catalogButtonText: 'Catalog button text',
  emptyText: 'Text when there are no products',
  sealText: 'Text running around the seal',
  sealBadge: 'Badge under the seal',
  leavesImage: 'Spices corner image (main)',
  chilliesImage: 'Chillies & spices corner image',
  promiseLeftImage: 'Our Promise: left image',
  promiseRightImage: 'Our Promise: right image',
  newsletterLeftImage: 'Newsletter: left image',
  newsletterRightImage: 'Newsletter: right image',
  helpTitle: 'Help card title',
  helpHours: 'Support hours line',
  whatsappNumber: 'WhatsApp number (with country code)',
  whatsappText: 'WhatsApp button text',
  contactText: 'Contact button text',
  placeholder: 'Email box placeholder',
  successText: 'Message after subscribing',
  privacy: 'Privacy note',
}

const SECTION_LABELS: Record<string, string> = {
  'promise.tag': 'Top tag text',
  'newsletter.label': 'Small label above the heading',
  'newsletter.line2': 'Heading line 2 (orange)',
  'gallery.badge': 'Small badge text',
}

const HINTS: Record<string, string> = {
  titleHighlight: 'This part of the heading is shown in orange.',
  line2Highlight: 'This part of the heading is shown in orange.',
  whatsappNumber: 'Digits only, e.g. 919493184110',
  'newsletter.line2': 'Shown in orange under line 1.',
  'promise.sealText': 'Keep it short, it is printed in a circle.',
}

const IMAGE_HINTS: Record<string, string> = {
  'showcase.src': 'Landscape or square photo, at least 1200px wide.',
  'gallery.image': 'Square photo (1:1), about 1000×1000px. It is shown as a square on the website, exactly like the preview.',
  'accents.leavesImage':
    "Use an image WITHOUT background (transparent PNG). Used in the corners of the About, Contact, Shop, Product, Cart, Checkout, Wishlist and Sign-in pages and the Nature's Goodness section.",
  'accents.chilliesImage':
    'Use an image WITHOUT background (transparent PNG). Used in the four corners of the Our Range section on the home page and on the Sign-in page.',
  'accents.promiseLeftImage':
    'Use an image WITHOUT background (transparent PNG), portrait shape. Shown on the left edge of the Our Promise section on the home page.',
  'accents.promiseRightImage':
    'Use an image WITHOUT background (transparent PNG), portrait shape. Shown on the right edge of the Our Promise section on the home page.',
  'accents.newsletterLeftImage':
    'Use an image WITHOUT background (transparent PNG), wide 3:2 shape. Bottom-left corner of the Newsletter banner at the bottom of the home page.',
  'accents.newsletterRightImage':
    'Use an image WITHOUT background (transparent PNG), wide 3:2 shape. Bottom-right corner of the Newsletter banner at the bottom of the home page.',
}

export type ImagePreview = { ratio: string; cover: boolean; width: string }

/** The preview box matches how the image is shown on the site (same shape, same crop). */
const IMAGE_PREVIEWS: Record<string, ImagePreview> = {
  'gallery.image': { ratio: '1 / 1', cover: true, width: 'w-28 sm:w-36' },
  'showcase.src': { ratio: '4 / 3', cover: true, width: 'w-36 sm:w-44' },
  'accents.leavesImage': { ratio: '1 / 1', cover: false, width: 'w-28 sm:w-36' },
  'accents.chilliesImage': { ratio: '1 / 1', cover: false, width: 'w-28 sm:w-36' },
  'accents.promiseLeftImage': { ratio: '1 / 1', cover: false, width: 'w-28 sm:w-36' },
  'accents.promiseRightImage': { ratio: '1 / 1', cover: false, width: 'w-28 sm:w-36' },
  'accents.newsletterLeftImage': { ratio: '3 / 2', cover: false, width: 'w-36 sm:w-44' },
  'accents.newsletterRightImage': { ratio: '3 / 2', cover: false, width: 'w-36 sm:w-44' },
}

const DEFAULT_IMAGE_PREVIEW: ImagePreview = { ratio: '8 / 5', cover: false, width: 'w-32' }

export const imagePreview = (section: string, key: string): ImagePreview =>
  IMAGE_PREVIEWS[`${section}.${key}`] ?? DEFAULT_IMAGE_PREVIEW

export const fieldLabel = (section: string, key: string) =>
  SECTION_LABELS[`${section}.${key}`] ??
  LABELS[key] ??
  key
    .replace(/([a-z])([A-Z0-9])/g, '$1 $2')
    .replace(/^./, (c) => c.toUpperCase())

export const fieldHint = (section: string, key: string) => HINTS[`${section}.${key}`] ?? HINTS[key]
export const imageHint = (section: string, key: string) => IMAGE_HINTS[`${section}.${key}`]

/** Rules for lists: what an item is called, and whether the admin can add / remove / reorder them. */
export const ARRAY_RULES: Record<string, { item: string; fixed?: boolean; max?: number }> = {
  slides: { item: 'Slide' },
  highlights: { item: 'Feature', fixed: true },
  tiles: { item: 'Photo' },
  benefits: { item: 'Benefit' },
  items: { item: 'Feature', fixed: true },
  cards: { item: 'Card', fixed: true },
  trustBadges: { item: 'Badge' },
  values: { item: 'Point' },
}

export type SectionTab = {
  key: HomeSectionKey | 'hero'
  label: string
  description: string
  Icon: LucideIcon
  /** Where the content that is NOT edited here lives (products, reels, FAQs…). */
  note?: { text: string; href: string; linkText: string }
  /** Anchor on the home page so "View on website" jumps to the section. */
  anchor?: string
}

export const SECTION_TABS: SectionTab[] = [
  {
    key: 'layout',
    label: 'Sections & Order',
    description: 'Show, hide and reorder the sections of the home page.',
    Icon: LayoutTemplate,
  },
  {
    key: 'hero',
    label: 'Hero Banner',
    description: 'The big banner at the top of the home page.',
    Icon: ImageIcon,
  },
  {
    key: 'shopByCategory',
    label: 'Shop by Category',
    description: 'Heading above the category cards.',
    Icon: FolderTree,
    anchor: 'shop-by-category',
    note: { text: 'The category cards come from your categories.', href: '/admin/categories', linkText: 'Edit categories' },
  },
  {
    key: 'pillars',
    label: 'Feature Bar',
    description: 'The four highlights in the white card under the hero.',
    Icon: ShieldCheck,
  },
  {
    key: 'spiceRange',
    label: 'Our Range',
    description: 'Heading and texts of the product grid.',
    Icon: ShoppingBag,
    note: { text: 'The products shown are the ones marked Featured.', href: '/admin/products', linkText: 'Edit products' },
  },
  {
    key: 'reels',
    label: 'Reels',
    description: 'Heading above the reels carousel.',
    Icon: Clapperboard,
    anchor: 'reels',
    note: { text: 'The videos themselves are managed in Reels.', href: '/admin/reels', linkText: 'Manage reels' },
  },
  {
    key: 'showcase',
    label: 'Image Slider + Story',
    description: 'Image slider on one side and the brand story on the other.',
    Icon: Images,
    anchor: 'showcase',
  },
  {
    key: 'gallery',
    label: "Nature's Goodness",
    description: 'Heading, benefit pills and the photo gallery.',
    Icon: Sparkles,
    anchor: 'uses',
  },
  {
    key: 'promise',
    label: 'Our Promise',
    description: 'The promise section with the heritage seal.',
    Icon: Star,
    anchor: 'our-promise',
  },
  {
    key: 'faq',
    label: 'FAQs',
    description: 'Heading, trust badges and the help card.',
    Icon: HelpCircle,
    anchor: 'faqs',
    note: { text: 'The questions and answers are managed in Global FAQs.', href: '/admin/global-faqs', linkText: 'Manage FAQs' },
  },
  {
    key: 'newsletter',
    label: 'Newsletter',
    description: 'Newsletter sign-up banner at the bottom.',
    Icon: Mail,
  },
  {
    key: 'accents',
    label: 'Corner Images',
    description: 'All the decorative corner images of the website, in one place. Always use images without a background (transparent PNG), otherwise a coloured box shows behind them.',
    Icon: Flower2,
  },
]

/** Names used in the Sections & Order tab. */
export const LAYOUT_LABELS: Record<string, { label: string; Icon: LucideIcon }> = {
  hero: { label: 'Hero Banner', Icon: ImageIcon },
  shopByCategory: { label: 'Shop by Category', Icon: FolderTree },
  pillars: { label: 'Feature Bar', Icon: ShieldCheck },
  spiceRange: { label: 'Our Range (products)', Icon: ShoppingBag },
  reels: { label: 'Reels', Icon: Clapperboard },
  showcase: { label: 'Image Slider + Story', Icon: Images },
  gallery: { label: "Nature's Goodness Gallery", Icon: Sparkles },
  promise: { label: 'Our Promise', Icon: Star },
  faq: { label: 'FAQs', Icon: HelpCircle },
  newsletter: { label: 'Newsletter', Icon: Mail },
}

