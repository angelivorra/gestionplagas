import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: '#5c3317',
          borderRadius: 36,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: 110,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: -4,
            fontFamily: 'sans-serif',
          }}
        >
          S
        </div>
        <div
          style={{
            width: 120,
            height: 14,
            background: '#1e6fa8',
            borderRadius: 4,
            marginTop: 8,
          }}
        />
      </div>
    ),
    { ...size },
  )
}
