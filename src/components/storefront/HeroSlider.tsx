'use client'

import { HeroBackgroundSlider, HeroSlideItem, GlobalHeroText } from './HeroBackgroundSlider'

export function HeroSlider({ 
  slides, 
  globalText, 
  textMode = 'per_slide',
}: { 
  slides: HeroSlideItem[], 
  globalText?: GlobalHeroText, 
  textMode?: 'global' | 'per_slide' 
}) {
  return (
    <HeroBackgroundSlider
      slides={slides}
      globalText={globalText}
      textMode={textMode}
    />
  )
}
