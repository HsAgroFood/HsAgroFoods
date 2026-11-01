import { SPICE_ASSETS } from '@/constants/assets'
import { isHomeIconName } from '@/lib/homeIconNames'

/**
 * Every editable piece of the storefront home page.
 *
 * HOME_DEFAULTS is exactly what the site showed before it became customisable, so a fresh install (or a
 * section the admin never touched) looks unchanged. Whatever the admin saves is merged on top of it.
 * The admin form in /admin/home-customization is generated from this shape, so a new field added here
 * shows up in the admin automatically.
 */
export const HOME_DEFAULTS = {
  /** Order of the home page sections and whether each one is shown. */
  layout: [
    { id: 'hero', visible: true },
    { id: 'shopByCategory', visible: true },
    { id: 'pillars', visible: true },
    { id: 'spiceRange', visible: true },
    { id: 'reels', visible: true },
    { id: 'showcase', visible: true },
    { id: 'gallery', visible: true },
    { id: 'promise', visible: true },
    { id: 'faq', visible: true },
    { id: 'newsletter', visible: true },
  ],

  shopByCategory: {
    badge: 'Shop by Category',
    titleFirst: 'Find Your',
    titleHighlight: 'Favourites',
    buttonText: 'View all products',
    buttonLink: '/shop',
  },

  pillars: {
    items: [
      { icon: 'Sprout', titleFirst: 'Sourced with', titleHighlight: 'Care', desc: 'Handpicked from the best farms across India.' },
      { icon: 'ChefHat', titleFirst: 'Rich in Aroma &', titleHighlight: 'Flavor', desc: 'Finely ground to lock in natural oils and taste.' },
      { icon: 'PackageCheck', titleFirst: 'Hygienically', titleHighlight: 'Packed', desc: 'Advanced packaging to ensure purity & freshness.' },
      { icon: 'FlaskConical', titleFirst: 'Lab', titleHighlight: 'Tested', desc: 'Every batch is tested for purity & safety.' },
    ],
  },

  spiceRange: {
    badge: '100% PURE & NATURAL',
    title: 'Our Spices & Dehydrated Range',
    subtitle: 'From pure ground & blended Indian masale to 100% natural dehydrated vegetable and fruit powders.',
    catalogButtonText: 'Explore Full Store Catalog',
    emptyText: 'No featured products to show here yet. Browse the full range in our shop.',
  },

  reels: {
    badge: 'Watch & Taste',
    titleFirst: 'Watch Our Latest',
    titleHighlight: 'Reels',
    subtitle: 'Discover our spices in action through quick videos. Tap any reel to watch with sound.',
  },

  showcase: {
    slides: [
      {
        src: '/images/about/about-hero.jpg',
        alt: 'Spices laid out on a rustic table in front of a green spice farm',
        caption: 'Grown on trusted farms',
      },
      {
        src: '/images/whole-spices.jpg',
        alt: 'Whole spices - cinnamon, cardamom, cloves and pepper on slate',
        caption: 'Whole spices, carefully sourced',
      },
      {
        src: '/images/bottom-banner.jpeg',
        alt: 'Bowls of turmeric, chilli and coriander powders',
        caption: 'Ground fresh, packed pure',
      },
    ],
    eyebrow: 'HS AgroFoods',
    titleFirst: 'Taste the Goodness in',
    titleHighlight: 'Every Pinch',
    paragraph:
      'Discover pure, farm-direct spices and nutrient-rich dehydrated powders, from golden Salem turmeric to vibrant beetroot and tomato. Cold-ground to lock in aroma, colour and nutrition, so every meal, snack and celebration tastes the way nature intended.',
    highlights: [
      { icon: 'Leaf', title: '100% Farm-Direct', detail: 'Sourced straight from growers' },
      { icon: 'Sparkles', title: 'Cold-Ground <40°C', detail: 'Below 40°C to keep aroma' },
      { icon: 'ShieldCheck', title: 'Lab Tested Purity', detail: 'Checked for purity and quality' },
    ],
    primaryText: 'Shop Now',
    primaryLink: '/shop',
    secondaryText: 'Our Story',
    secondaryLink: '/about',
  },

  gallery: {
    badge: '100% Pure & Natural',
    titleLine1: "Nature's Goodness",
    titleLine2: 'In Every',
    titleHighlight: 'Pinch & Spoon',
    subtitle:
      'From high-curcumin Salem turmeric and aromatic spice blends to nutrient-dense Beetroot, Tomato & Banana powders — crafted for healthy everyday living.',
    benefits: [
      { icon: 'ShieldCheck', label: 'Boosts Immunity' },
      { icon: 'Salad', label: 'Aids Digestion' },
      { icon: 'Leaf', label: 'Rich in Antioxidants' },
      { icon: 'Target', label: 'Anti-inflammatory Properties' },
    ],
    tiles: [
      {
        title: 'Energy Booster',
        tag: 'Natural nutrition for an active lifestyle',
        cta: 'Explore Turmeric',
        image: SPICE_ASSETS.recipes.energyBooster,
        href: '/product/turmeric-powder',
      },
      {
        title: 'From Our Farms',
        tag: 'Handpicked at peak freshness',
        cta: 'Our Story',
        image: '/images/about/about-farmers.jpg',
        href: '/about',
      },
      {
        title: 'Better Digestion',
        tag: 'Supports a healthy digestive system',
        cta: 'Explore Zeera',
        image: SPICE_ASSETS.recipes.betterDigestion,
        href: '/product/zeera-powder',
      },
      {
        title: 'Healthy Heart',
        tag: 'Goodness of natural spices for a stronger heart',
        cta: 'Explore Coriander',
        image: SPICE_ASSETS.recipes.healthyHeart,
        href: '/product/coriander-powder',
      },
      {
        title: 'Stone-Ground Fresh',
        tag: 'Slow-ground to lock in aroma',
        cta: 'Shop Spices',
        image: '/images/about/about-grinding.jpg',
        href: '/shop',
      },
      {
        title: 'Natural Healing',
        tag: 'Powered by nature for a healthier you',
        cta: 'Explore Turmeric',
        image: SPICE_ASSETS.recipes.naturalHealing,
        href: '/product/turmeric-powder',
      },
    ],
  },

  promise: {
    tag: 'NATURAL • HEALTHY • PURE',
    line1: 'Our Promise',
    line2First: 'Pure. Natural.',
    line2Highlight: 'Trusted.',
    description:
      'At HS AgroFoods, we promise to deliver pure Indian spices and dehydrated vegetable & fruit powders that are 100% natural & free from harmful additives.',
    sealText: '★ HS AGROFOODS ★ 100% PURE & NATURAL ★ TRADITIONAL TASTE ★',
    sealBadge: 'HERITAGE SEAL',
    cards: [
      { icon: 'Leaf', title: '100% Natural', desc: 'Nothing artificial, Just pure spices.' },
      { icon: 'FlaskConical', title: 'No Preservatives', desc: 'No chemicals, no compromise.' },
      { icon: 'Trophy', title: 'Finest Quality', desc: 'Carefully selected & ground.' },
      { icon: 'Heart', title: 'Trusted by Thousands', desc: 'Customer trust is our biggest reward.' },
    ],
  },

  faq: {
    badge: 'Got Questions?',
    titleLine1: 'Everything You Want',
    titleLine2: 'To',
    titleHighlight: 'Know',
    subtitle:
      "Quick answers about our purity, delivery, payments and bulk orders. Can't find yours? Just ask, we reply fast.",
    trustBadges: [{ icon: 'Leaf', label: '100% Natural' }, { icon: 'ShieldCheck', label: 'FSSAI Certified' }, { icon: 'Truck', label: 'Pan-India Delivery' }],
    helpTitle: 'Still have a question?',
    helpHours: 'Chat with us Mon – Sat, 9:00 AM – 7:00 PM IST',
    whatsappNumber: '919493184110',
    whatsappText: 'WhatsApp us',
    contactText: 'Contact page',
  },

  newsletter: {
    label: 'NEWSLETTER',
    line1: 'Stay Updated with',
    line2: 'Our Latest Spices & Offers',
    subtitle: 'Join our newsletter and be the first to know about new products, special offers and healthy living tips.',
    placeholder: 'Enter your email address',
    buttonText: 'Subscribe',
    successText: "You're subscribed! Check your inbox for exclusive perks.",
    values: [{ icon: 'Check', label: 'Exclusive Offers' }, { icon: 'Tag', label: 'New Arrivals' }, { icon: 'Gift', label: 'Healthy Living Tips' }],
    privacy: 'Your email is safe with us. No spam, ever.',
  },
  // Decorative corner artwork used across the whole website (not only the home page)
  accents: {
    leavesImage: '/images/accent-leaves-spices.png',
    chilliesImage: '/images/accent-chillies-corner.png',
    promiseLeftImage: '/images/images_010/left.png',
    promiseRightImage: '/images/images_010/right.png',
    newsletterLeftImage: '/images/newsletter/newsletter1.png',
    newsletterRightImage: '/images/newsletter/newsletter2.png',
  },
}

export type HomeContent = typeof HOME_DEFAULTS
export type HomeSectionKey = keyof HomeContent
export const HOME_SECTION_KEYS = Object.keys(HOME_DEFAULTS) as HomeSectionKey[]

/** Sections that can be reordered / hidden on the home page (ids used in `layout`). */
export const LAYOUT_SECTION_IDS = HOME_DEFAULTS.layout.map((item) => item.id)

const MAX_TEXT_LENGTH = 1200
/** Safety cap only: lists (photos, slides…) can hold this many items. */
export const MAX_LIST_ITEMS = 100

const isLinkKey = (key: string) => /(link|href)$/i.test(key)
const isImageKey = (key: string) => /^(src|image)$|Image$/.test(key)
const isIconKey = (key: string) => key === 'icon'

/** Internal paths and http(s) links only; anything else (javascript:, data:, //evil) is dropped. */
function safeLink(value: string) {
  if (value === '') return ''
  if (value.startsWith('/') && !value.startsWith('//')) return value
  if (/^https?:\/\//i.test(value)) return value
  return ''
}

/** Images must come from the site itself or from ImageKit (the only remote host next/image allows). */
function safeImage(value: string, fallback: string) {
  if (value.startsWith('/') && !value.startsWith('//')) return value
  if (/^https:\/\/ik\.imagekit\.io\//i.test(value)) return value
  return fallback
}

/**
 * Coerces `input` into the same shape and types as `template` (the matching default):
 * unknown keys are dropped, wrong types fall back to the default, text is trimmed and length-limited,
 * links and image URLs are validated, and lists keep their item shape.
 */
export function sanitizeLike<T>(input: unknown, template: T, key = ''): T {
  if (typeof template === 'string') {
    const text = typeof input === 'string' ? input.trim().slice(0, MAX_TEXT_LENGTH) : template
    if (isLinkKey(key)) return safeLink(text) as T
    if (isImageKey(key)) return safeImage(text, template) as T
    if (isIconKey(key)) return (isHomeIconName(text) ? text : template) as T
    return text as T
  }

  if (typeof template === 'boolean') {
    return (typeof input === 'boolean' ? input : template) as T
  }

  if (typeof template === 'number') {
    return (typeof input === 'number' && Number.isFinite(input) ? input : template) as T
  }

  if (Array.isArray(template)) {
    if (!Array.isArray(input)) return template
    const itemTemplate = template[0]
    if (itemTemplate === undefined) return [] as T
    return input.slice(0, MAX_LIST_ITEMS).map((item) => sanitizeLike(item, itemTemplate, key)) as T
  }

  if (template && typeof template === 'object') {
    const source = input && typeof input === 'object' ? (input as Record<string, unknown>) : {}
    const out: Record<string, unknown> = {}
    for (const [childKey, childTemplate] of Object.entries(template as Record<string, unknown>)) {
      out[childKey] = sanitizeLike(source[childKey], childTemplate, childKey)
    }
    return out as T
  }

  return template
}

/** Keeps each known section exactly once, in the admin's order, and appends any section that is missing. */
export function normalizeLayout(layout: HomeContent['layout']): HomeContent['layout'] {
  const seen = new Set<string>()
  const result: HomeContent['layout'] = []

  for (const item of layout) {
    if (LAYOUT_SECTION_IDS.includes(item.id) && !seen.has(item.id)) {
      seen.add(item.id)
      result.push({ id: item.id, visible: item.visible })
    }
  }
  for (const item of HOME_DEFAULTS.layout) {
    if (!seen.has(item.id)) result.push({ ...item })
  }
  return result
}

/** Stored (possibly partial or outdated) content merged onto the defaults. */
export function mergeHomeContent(stored: unknown): HomeContent {
  const source = stored && typeof stored === 'object' ? (stored as Record<string, unknown>) : {}
  const merged = {} as Record<string, unknown>
  for (const sectionKey of HOME_SECTION_KEYS) {
    merged[sectionKey] = sanitizeLike(source[sectionKey], HOME_DEFAULTS[sectionKey])
  }
  const content = merged as HomeContent
  content.layout = normalizeLayout(content.layout)
  return content
}
