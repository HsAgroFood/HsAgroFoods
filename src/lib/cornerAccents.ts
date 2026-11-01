import { cache } from 'react'
import { getHomeContent } from '@/actions/admin/homeContent'

/** The admin-chosen corner artwork, read once per request. */
export const getCornerAccents = cache(async () => (await getHomeContent()).accents)
