import { ImageResponse } from 'next/og'

export const alt = 'HS AgroFoods — Pure Spices & Dehydrated Veg & Fruit Powders'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/** The picture shown when the website is shared on WhatsApp, Facebook, X and in Google Discover. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 90px',
          background: 'linear-gradient(135deg, #14361F 0%, #1F5A33 60%, #E07B0C 160%)',
          color: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', fontSize: 30, letterSpacing: 8, color: '#F09819', fontWeight: 700 }}>
          PURE • NATURAL • TRUSTED
        </div>
        <div style={{ display: 'flex', fontSize: 104, fontWeight: 800, marginTop: 24, lineHeight: 1.05 }}>
          <span>HS</span>
          <span style={{ color: '#F09819', marginLeft: 24 }}>AgroFoods</span>
        </div>
        <div style={{ display: 'flex', fontSize: 40, marginTop: 28, color: 'rgba(255,255,255,0.88)', lineHeight: 1.3 }}>
          100% pure cold-ground spices and natural dehydrated veg and fruit powders
        </div>
        <div style={{ display: 'flex', fontSize: 30, marginTop: 44, color: 'rgba(255,255,255,0.7)' }}>
          Hyderabad • Delivered across India
        </div>
      </div>
    ),
    size
  )
}
