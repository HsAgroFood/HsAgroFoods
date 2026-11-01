import { getHomeContent } from '@/actions/admin/homeContent'
import { getHeroLinkOptions } from '@/actions/admin/hero'
import { HomeCustomizer } from './_components/HomeCustomizer'

export const metadata = {
  title: 'Home Customization | Admin Dashboard',
}

export const dynamic = 'force-dynamic'

export default async function AdminHomeCustomizationPage() {
  const [content, linkOptions] = await Promise.all([getHomeContent(), getHeroLinkOptions()])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Home Customization</h1>
        <p className="mt-1 text-sm text-stone-500">
          Change the text, images, buttons and order of every section on the home page. Pick a section below, edit it and
          press <strong>Save changes</strong>.
        </p>
      </div>

      <HomeCustomizer initial={content} linkOptions={linkOptions} />
    </div>
  )
}
