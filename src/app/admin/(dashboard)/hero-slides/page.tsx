import { getHeroSlides, getHeroConfig, getHeroLinkOptions } from '@/actions/admin/hero'
import { GlobalHeroTextForm } from './_components/GlobalHeroTextForm'
import { HeroSlideList } from './_components/HeroSlideList'
import { TextModeToggle } from './_components/TextModeToggle'
import { ShowTextToggle } from './_components/ShowTextToggle'
import { BannerVisibilityControl } from './_components/BannerVisibilityControl'

export const metadata = {
  title: 'Hero Slides | Admin Dashboard',
}

export const dynamic = 'force-dynamic'

export default async function AdminHeroSlidesPage() {
  const [slides, heroConfig, linkOptions] = await Promise.all([getHeroSlides(), getHeroConfig(), getHeroLinkOptions()])

  const currentMode = heroConfig.text_mode
  const showText = heroConfig.show_text

  const globalText = {
    ...heroConfig.global_text,
    text_mode: currentMode,
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Hero Section</h1>
          <p className="text-sm text-stone-500 mt-1">
            Manage the sliding background images and text overlay for the storefront homepage.
          </p>
        </div>
        
        {showText && <TextModeToggle currentMode={currentMode} />}
      </div>

      <div className="space-y-4">
        <ShowTextToggle initialShowText={showText} />

        {/* The dark overlay only exists to keep text readable, so this only matters when text is shown */}
        {showText && (
          <BannerVisibilityControl
            initialValue={heroConfig.banner_visibility}
            previewImage={slides.find((s: { is_active?: boolean }) => s.is_active)?.image_url ?? slides[0]?.image_url}
          />
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column: Global Text Overlay (only visible if mode is global) */}
        {showText && currentMode === 'global' && (
          <div className="xl:col-span-5">
            <GlobalHeroTextForm initialData={globalText} />
          </div>
        )}

        {/* Right Column: Background Images (Slides) */}
        <div className={showText && currentMode === 'global' ? 'xl:col-span-7' : 'xl:col-span-12'}>
          <HeroSlideList 
            initialSlides={slides} 
            globalText={globalText} 
            textMode={currentMode} 
            showText={showText}
            linkOptions={linkOptions}
          />
        </div>

      </div>
    </div>
  )
}
