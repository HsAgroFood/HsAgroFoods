'use client'

import { useState, useTransition } from 'react'
import { saveHeroSlide, deleteHeroSlide, toggleHeroSlideStatus } from '@/actions/admin/hero'
import { Trash2, Plus, Image as ImageIcon, Loader2, Save, Check, ExternalLink } from 'lucide-react'
import { SlideImagesField } from './SlideImagesField'

interface SlideData {
  id: string
  image_url: string
  image_mobile_url?: string | null
  title: string
  subtitle: string
  button_text: string
  button_link: string
  is_active: boolean
  display_order?: number
}

export function HeroSlideList({ 
  initialSlides, 
  globalText: _globalText, 
  textMode: _textMode 
}: { 
  initialSlides: any[], 
  globalText: any, 
  textMode: 'global' | 'per_slide' 
}) {
  const [slides, setSlides] = useState<SlideData[]>(initialSlides || [])
  const [isPending, startTransition] = useTransition()
  const [savedId, setSavedId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newSlide, setNewSlide] = useState({
    image_url: '',
    image_mobile_url: null as string | null,
    title: 'Pure Spice. Real Taste. Trusted Every Time.',
    subtitle: "HS AgroFoods brings the richness of India's finest spices to your kitchen. Pure, natural & full of flavor.",
    button_text: 'Shop Now',
    button_link: '/shop',
  })

  const updateSlideField = (id: string, field: keyof SlideData, value: any) => {
    setSlides(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  const handleSaveSlide = (slide: SlideData) => {
    startTransition(async () => {
      const res = await saveHeroSlide({
        id: slide.id,
        image_url: slide.image_url,
        image_mobile_url: slide.image_mobile_url,
        title: slide.title,
        subtitle: slide.subtitle,
        button_text: slide.button_text,
        button_link: slide.button_link,
        is_active: slide.is_active,
      })

      if (res.success) {
        setSavedId(slide.id)
        setTimeout(() => setSavedId(null), 3000)
      } else {
        alert(res.error || 'Failed to save slide')
      }
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this hero slide?')) return
    
    startTransition(async () => {
      const res = await deleteHeroSlide(id)
      if (res.success) {
        setSlides(prev => prev.filter(s => s.id !== id))
      } else {
        alert(res.error || 'Failed to delete slide')
      }
    })
  }

  const handleToggleActive = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      const res = await toggleHeroSlideStatus(id, !currentStatus)
      if (res.success) {
        setSlides(prev => prev.map(s => s.id === id ? { ...s, is_active: !currentStatus } : s))
      } else {
        alert(res.error || 'Failed to update status')
      }
    })
  }

  const handleCreateNewSlide = () => {
    if (!newSlide.image_url) {
      alert('Please upload an image for the slide first.')
      return
    }

    startTransition(async () => {
      const res = await saveHeroSlide({
        image_url: newSlide.image_url,
        image_mobile_url: newSlide.image_mobile_url,
        title: newSlide.title,
        subtitle: newSlide.subtitle,
        button_text: newSlide.button_text,
        button_link: newSlide.button_link,
        is_active: true,
      })

      if (res.success) {
        window.location.reload()
      } else {
        alert(res.error || 'Failed to create slide')
      }
    })
  }

  const activeCount = slides.filter(s => s.is_active).length

  return (
    <div className="space-y-6">
      {/* Top Banner with Add Slide button */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold text-stone-900">Hero Slider Slides ({slides.length})</h2>
          </div>
          <p className="text-sm text-stone-500 mt-1">
            {activeCount} active slides rotating on the storefront. Edit any slide details below and click <strong>Save Slide</strong>.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'Close Add Form' : 'Add New Slide'}
        </button>
      </div>

      {/* New Slide Creation Form */}
      {showAddForm && (
        <div className="bg-orange-50/50 rounded-2xl border-2 border-orange-200 p-4 sm:p-6 space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-orange-500" />
              Create New Hero Slide
            </h3>
            <span className="text-xs font-semibold text-orange-700 bg-orange-100 px-2.5 py-1 rounded-full">
              New Slide
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Desktop + Phone images */}
            <div className="lg:col-span-4">
              <SlideImagesField
                desktopUrl={newSlide.image_url}
                mobileUrl={newSlide.image_mobile_url}
                disabled={isPending}
                onDesktopChange={(url) => setNewSlide(prev => ({ ...prev, image_url: url }))}
                onMobileChange={(url) => setNewSlide(prev => ({ ...prev, image_mobile_url: url }))}
              />
            </div>

            {/* Content Fields */}
            <div className="lg:col-span-8 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Heading / Title</label>
                <input
                  type="text"
                  value={newSlide.title}
                  onChange={(e) => setNewSlide(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Golden Purity. Natural Healing."
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Subtitle / Description</label>
                <textarea
                  rows={2}
                  value={newSlide.subtitle}
                  onChange={(e) => setNewSlide(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="e.g. Handpicked Salem & Alleppey turmeric roots..."
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={newSlide.button_text}
                    onChange={(e) => setNewSlide(prev => ({ ...prev, button_text: e.target.value }))}
                    placeholder="Shop Now"
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Button Link</label>
                  <input
                    type="text"
                    value={newSlide.button_link}
                    onChange={(e) => setNewSlide(prev => ({ ...prev, button_link: e.target.value }))}
                    placeholder="/shop or /product/slug"
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex sm:justify-end">
                <button
                  type="button"
                  onClick={handleCreateNewSlide}
                  disabled={isPending || !newSlide.image_url}
                  className="w-full sm:w-auto justify-center px-5 py-3 sm:py-2.5 bg-orange-500 text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save & Publish Slide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List of existing slides */}
      <div className="space-y-6">
        {slides.length === 0 ? (
          <div className="text-center py-16 bg-white border-2 border-dashed border-stone-200 rounded-2xl">
            <ImageIcon className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-stone-800">No slides found in database</h3>
            <p className="text-sm text-stone-500 mt-1 max-w-sm mx-auto">
              Click &quot;Add New Slide&quot; above to upload your first hero slide with ImageKit.
            </p>
          </div>
        ) : (
          slides.map((slide, index) => {
            const isSaved = savedId === slide.id

            return (
              <div 
                key={slide.id} 
                className={`bg-white rounded-2xl border transition-all p-4 sm:p-6 shadow-sm ${
                  slide.is_active ? 'border-stone-200' : 'border-stone-200/60 opacity-70 bg-stone-50/50'
                }`}
              >
                {/* Header info */}
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 pb-4 border-b border-stone-100 mb-5">
                  <div className="flex w-full min-w-0 items-center gap-3 sm:w-auto sm:flex-1">
                    <span className="w-7 h-7 shrink-0 rounded-full bg-stone-100 text-stone-700 text-xs font-bold flex items-center justify-center border border-stone-200">
                      #{index + 1}
                    </span>
                    <h3 className="min-w-0 text-sm font-bold text-stone-900 line-clamp-2 break-words">
                      Slide {index + 1}: {slide.title || 'Untitled Slide'}
                    </h3>
                  </div>

                  <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
                    {/* Status badge & toggle */}
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        slide.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-100 text-stone-500'
                      }`}>
                        {slide.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={slide.is_active}
                          onChange={() => handleToggleActive(slide.id, slide.is_active)}
                          disabled={isPending}
                        />
                        <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>

                    <button
                      onClick={() => handleDelete(slide.id)}
                      disabled={isPending}
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Slide"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Main slide editor row */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: Desktop + Phone images */}
                  <div className="lg:col-span-4">
                    <SlideImagesField
                      desktopUrl={slide.image_url}
                      mobileUrl={slide.image_mobile_url}
                      disabled={isPending}
                      onDesktopChange={(url) => updateSlideField(slide.id, 'image_url', url)}
                      onMobileChange={(url) => updateSlideField(slide.id, 'image_mobile_url', url)}
                    />
                  </div>

                  {/* Right: Editable content fields */}
                  <div className="lg:col-span-8 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Heading / Title</label>
                      <input
                        type="text"
                        value={slide.title || ''}
                        onChange={(e) => updateSlideField(slide.id, 'title', e.target.value)}
                        placeholder="e.g. Golden Purity. Natural Healing."
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Subtitle / Description</label>
                      <textarea
                        rows={2}
                        value={slide.subtitle || ''}
                        onChange={(e) => updateSlideField(slide.id, 'subtitle', e.target.value)}
                        placeholder="e.g. Handpicked Salem & Alleppey turmeric roots..."
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-stone-700 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">Button Text</label>
                        <input
                          type="text"
                          value={slide.button_text || ''}
                          onChange={(e) => updateSlideField(slide.id, 'button_text', e.target.value)}
                          placeholder="Shop Now"
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-stone-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">Button Link</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={slide.button_link || ''}
                            onChange={(e) => updateSlideField(slide.id, 'button_link', e.target.value)}
                            placeholder="/shop or /product/turmeric-powder"
                            className="w-full pl-3 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-stone-900"
                          />
                          {slide.button_link && (
                            <a
                              href={slide.button_link}
                              target="_blank"
                              rel="noreferrer"
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                              title="Preview link"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Save Action for this Slide */}
                    <div className="pt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-xs text-stone-400">
                        Changes will appear immediately on the homepage.
                      </span>

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                        {isSaved && (
                          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                            <Check className="w-4 h-4 text-emerald-600" />
                            Saved successfully!
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleSaveSlide(slide)}
                          disabled={isPending}
                          className="w-full sm:w-auto justify-center px-5 py-3 sm:py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95 whitespace-nowrap"
                        >
                          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          Save Slide
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
