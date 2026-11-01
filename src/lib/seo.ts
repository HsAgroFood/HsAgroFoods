import type { Metadata } from 'next'

/** Public address of the website. Set NEXT_PUBLIC_SITE_URL in the environment; the production domain is the fallback. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, '') || 'https://www.hsagrofoods.com')
export const SITE_NAME = 'HS AgroFoods'

export const CONTACT = {
  phone: '+91 94931 84110',
  email: 'Hs.foodofficial@gmail.com',
  street: '4-11-92/3/A, M.M. Pahadi, Attapur',
  city: 'Hyderabad',
  region: 'Telangana',
  postalCode: '500048',
  country: 'IN',
}

export const SOCIAL_LINKS = [
  'https://www.instagram.com/hs_agro_foods',
  'https://youtube.com/@hsagrofoods',
  'https://www.facebook.com/share/1A5kcJC8iR/',
]

/** Turns a path ("/shop") or an image URL into a full https address. */
export function absoluteUrl(pathOrUrl?: string | null): string {
  if (!pathOrUrl) return SITE_URL
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  return `${SITE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`
}

/** For pages that must never appear in Google (cart, checkout, account, admin, sign-in…). */
export const NO_INDEX: Metadata['robots'] = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: { index: false, follow: false, noimageindex: true },
}

type Json = Record<string, unknown>

export function organizationJsonLd(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl('/images/logo.png'),
    image: absoluteUrl('/images/logo.png'),
    description:
      'HS AgroFoods sells 100% pure cold-ground Indian spices and natural low-temperature dehydrated vegetable and fruit powders, shipped across India from Hyderabad.',
    email: CONTACT.email,
    telephone: CONTACT.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: CONTACT.street,
      addressLocality: CONTACT.city,
      addressRegion: CONTACT.region,
      postalCode: CONTACT.postalCode,
      addressCountry: CONTACT.country,
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        telephone: CONTACT.phone,
        email: CONTACT.email,
        areaServed: 'IN',
      },
    ],
    sameAs: SOCIAL_LINKS,
  }
}

export function websiteJsonLd(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: 'en-IN',
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/shop?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

type ProductLd = {
  slug: string
  name: string
  description?: string | null
  images: (string | null | undefined)[]
  sku?: string | null
  category?: string | null
  variants: { price: number; is_active?: boolean; stock_quantity?: number | null }[]
  ratingValue?: number | null
  ratingCount?: number | null
  reviews?: { author: string; rating: number; text?: string | null; date?: string | null }[]
}

export function productJsonLd(product: ProductLd): Json {
  const variants = product.variants.filter((v) => v.is_active !== false && Number.isFinite(Number(v.price)))
  const prices = variants.map((v) => Number(v.price))
  const inStock = variants.some((v) => v.stock_quantity == null || Number(v.stock_quantity) > 0)
  const images = product.images.filter((img): img is string => !!img).map((img) => absoluteUrl(img))
  const url = absoluteUrl(`/product/${product.slug}`)

  const ld: Json = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: product.name,
    url,
    brand: { '@type': 'Brand', name: SITE_NAME },
    manufacturer: { '@id': `${SITE_URL}/#organization` },
  }
  if (product.description) ld.description = product.description
  if (images.length > 0) ld.image = images
  if (product.sku) ld.sku = product.sku
  if (product.category) ld.category = product.category

  if (prices.length > 0) {
    ld.offers = {
      '@type': 'AggregateOffer',
      url,
      priceCurrency: 'INR',
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: prices.length,
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': `${SITE_URL}/#organization` },
    }
  }

  const count = Number(product.ratingCount) || 0
  const rating = Number(product.ratingValue) || 0
  if (count > 0 && rating > 0) {
    ld.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Number(rating.toFixed(1)),
      reviewCount: count,
      bestRating: 5,
      worstRating: 1,
    }
  }

  if (product.reviews && product.reviews.length > 0) {
    ld.review = product.reviews.slice(0, 5).map((review) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: review.author },
      reviewRating: { '@type': 'Rating', ratingValue: review.rating, bestRating: 5, worstRating: 1 },
      ...(review.text ? { reviewBody: review.text } : {}),
      ...(review.date ? { datePublished: review.date.slice(0, 10) } : {}),
    }))
  }

  return ld
}

/** Removes a trailing "| HS AgroFoods" from a title, because the site-wide title template adds it again. */
export function stripBrand(title?: string | null): string {
  return (title || '').replace(/\s*[|\-–—]\s*HS\s*Agro\s*Foods\s*$/i, '').trim()
}

/** Trims text to a search-result friendly length without cutting a word in half. */
export function clip(text?: string | null, max = 160): string {
  const clean = (text || '').replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, max - 1).replace(/\s+\S*$/, '')}…`
}
