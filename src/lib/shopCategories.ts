export type ShopCategoryInput = {
  name: string
  slug: string
  description?: string | null
  image_url?: string | null
  badge_text?: string | null
}

export type ShopCategory = {
  name: string
  slug: string
  href: string
  subtext: string
  /** Short tag shown next to the name; comes from the category's "Tag" field in the admin. */
  badge: string | null
  image: string
}

const PLACEHOLDER_IMAGE = '/images/logo.png'

/** Everything shown for a category in the storefront menus comes from the database row. */
export function resolveShopCategories(categories: ShopCategoryInput[]): ShopCategory[] {
  return categories.map((c) => ({
    name: c.name,
    slug: c.slug,
    href: `/shop?category=${c.slug}`,
    subtext: c.description || '',
    badge: c.badge_text?.trim() || null,
    image: c.image_url || PLACEHOLDER_IMAGE,
  }))
}
