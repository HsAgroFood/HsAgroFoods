'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { saveHeroSlide, deleteHeroSlide, toggleHeroSlideStatus } from '@/actions/admin/hero'
import { Trash2, Plus, Image as ImageIcon, Loader2, Save, Check, ExternalLink, RefreshCw } from 'lucide-react'
import { ImageKitUpload } from '@/components/admin/ImageKitUpload'

interface SlideData {
  id: string
  image_url: string
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
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-spice-primary" />
            <h2 className="text-lg font-bold text-stone-900">Hero Slider Slides ({slides.length})</h2>
          </div>
          <p className="text-sm text-stone-500 mt-1">
            {activeCount} active slides rotating on the storefront. Edit any slide details below and click <strong>Save Slide</strong>.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-spice-primary text-white text-sm font-semibold rounded-xl hover:bg-spice-secondary transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'Close Add Form' : 'Add New Slide'}
        </button>
      </div>

      {/* New Slide Creation Form */}
      {showAddForm && (
        <div className="bg-orange-50/50 rounded-2xl border-2 border-orange-200 p-6 space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-spice-primary" />
              Create New Hero Slide
            </h3>
            <span className="text-xs font-semibold text-orange-700 bg-orange-100 px-2.5 py-1 rounded-full">
              New Slide
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Image Preview & Upload */}
            <div className="lg:col-span-4 space-y-3">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">Slide Image (16:9)</label>
              <div className="relative aspect-video rounded-xl bg-stone-100 border border-stone-200 overflow-hidden flex items-center justify-center">
                {newSlide.image_url ? (
                  <Image
                    src={newSlide.image_url}
                    alt="Slide preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                    <span className="text-xs text-stone-500">No image selected</span>
                  </div>
                )}
              </div>

              <ImageKitUpload
                folder="/hero-slides"
                multiple={false}
                onSuccess={(res) => setNewSlide(prev => ({ ...prev, image_url: res.url }))}
              >
                {({ open, isUploading }) => (
                  <button
                    type="button"
                    onClick={open}
                    disabled={isUploading || isPending}
                    className="w-full py-2 px-3 bg-white border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    {newSlide.image_url ? 'Change Image' : 'Upload Image (ImageKit)'}
                  </button>
                )}
              </ImageKitUpload>
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
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-spice-primary/20 focus:border-spice-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Subtitle / Description</label>
                <textarea
                  rows={2}
                  value={newSlide.subtitle}
                  onChange={(e) => setNewSlide(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="e.g. Handpicked Salem & Alleppey turmeric roots..."
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-spice-primary/20 focus:border-spice-primary resize-none"
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
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-spice-primary/20 focus:border-spice-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Button Link</label>
                  <input
                    type="text"
                    value={newSlide.button_link}
                    onChange={(e) => setNewSlide(prev => ({ ...prev, button_link: e.target.value }))}
                    placeholder="/shop or /product/slug"
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-spice-primary/20 focus:border-spice-primary"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleCreateNewSlide}
                  disabled={isPending || !newSlide.image_url}
                  className="px-5 py-2.5 bg-spice-primary text-white text-sm font-bold rounded-xl hover:bg-spice-secondary transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
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
                className={`bg-white rounded-2xl border transition-all p-6 shadow-sm ${
                  slide.is_active ? 'border-stone-200' : 'border-stone-200/60 opacity-70 bg-stone-50/50'
                }`}
              >
                {/* Header info */}
                <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-stone-100 text-stone-700 text-xs font-bold flex items-center justify-center border border-stone-200">
                      #{index + 1}
                    </span>
                    <h3 className="text-sm font-bold text-stone-900">
                      Slide {index + 1}: {slide.title || 'Untitled Slide'}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
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
                  {/* Left: Image preview and ImageKit change */}
                  <div className="lg:col-span-4 space-y-3">
                    <div className="relative aspect-video rounded-xl bg-stone-100 border border-stone-200 overflow-hidden">
                      {slide.image_url ? (
                        <Image
                          src={slide.image_url}
                          alt={slide.title || 'Slide Image'}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center text-xs text-stone-400">
                          No Image
                        </div>
                      )}
                    </div>

                    <ImageKitUpload
                      folder="/hero-slides"
                      multiple={false}
                      onSuccess={(res) => updateSlideField(slide.id, 'image_url', res.url)}
                    >
                      {({ open, isUploading }) => (
                        <button
                          type="button"
                          onClick={open}
                          disabled={isUploading || isPending}
                          className="w-full py-2 px-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg text-xs font-semibold text-stone-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                          Replace Image (ImageKit)
                        </button>
                      )}
                    </ImageKitUpload>
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
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-spice-primary/20 focus:border-spice-primary transition-all font-medium text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Subtitle / Description</label>
                      <textarea
                        rows={2}
                        value={slide.subtitle || ''}
                        onChange={(e) => updateSlideField(slide.id, 'subtitle', e.target.value)}
                        placeholder="e.g. Handpicked Salem & Alleppey turmeric roots..."
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-spice-primary/20 focus:border-spice-primary transition-all text-stone-700 resize-none"
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
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-spice-primary/20 focus:border-spice-primary transition-all text-stone-900"
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
                            className="w-full pl-3 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-spice-primary/20 focus:border-spice-primary transition-all text-stone-900"
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
                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-xs text-stone-400">
                        Changes will appear immediately on the homepage.
                      </span>

                      <div className="flex items-center gap-3">
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
                          className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
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
