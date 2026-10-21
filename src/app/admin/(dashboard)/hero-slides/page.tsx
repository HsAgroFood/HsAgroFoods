import { getHeroSlides, getHeroConfig } from '@/actions/admin/hero'
import { GlobalHeroTextForm } from './_components/GlobalHeroTextForm'
import { HeroSlideList } from './_components/HeroSlideList'
import { TextModeToggle } from './_components/TextModeToggle'

export const metadata = {
  title: 'Hero Slides | Admin Dashboard',
}

export default async function AdminHeroSlidesPage() {
  const [slides, heroConfig] = await Promise.all([getHeroSlides(), getHeroConfig()])

  const currentMode = heroConfig.text_mode

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
        
        <TextModeToggle currentMode={currentMode} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column: Global Text Overlay (only visible if mode is global) */}
        {currentMode === 'global' && (
          <div className="xl:col-span-5">
            <GlobalHeroTextForm initialData={globalText} />
          </div>
        )}

        {/* Right Column: Background Images (Slides) */}
        <div className={currentMode === 'global' ? 'xl:col-span-7' : 'xl:col-span-12'}>
          <HeroSlideList 
            initialSlides={slides} 
            globalText={globalText} 
            textMode={currentMode} 
          />
        </div>

      </div>
    </div>
  )
}
