/** Slider value 0-100 that lightens the dark text overlay on the hero. 40 matches the original look. */
export const DEFAULT_BANNER_VISIBILITY = 40

// Original overlay opacities (black) at each gradient stop
const MOBILE_STOPS = [0.95, 0.7, 0.35]
const DESKTOP_STOPS = [0.92, 0.65, 0.25]

/** 1 = original darkness, 0 = no overlay, above 1 = darker than the original. */
function overlayScale(visibility: number) {
  const v = Math.min(100, Math.max(0, visibility))
  return (100 - v) / (100 - DEFAULT_BANNER_VISIBILITY)
}

function gradient(direction: 'to top' | 'to right', stops: number[], visibility: number) {
  const scale = overlayScale(visibility)
  const colors = stops.map((opacity) => `rgba(0, 0, 0, ${Math.min(1, opacity * scale).toFixed(3)})`)
  return `linear-gradient(${direction}, ${colors.join(', ')})`
}

/** Dark text-readability overlays for the hero, scaled by the admin's "Banner visibility" setting. */
export function getHeroOverlays(visibility: number) {
  return {
    mobile: gradient('to top', MOBILE_STOPS, visibility),
    desktop: gradient('to right', DESKTOP_STOPS, visibility),
  }
}
