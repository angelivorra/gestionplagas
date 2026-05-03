import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: '#5c3317',
          borderRadius: 6,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: 20,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: -1,
            fontFamily: 'sans-serif',
          }}
        >
          S
        </div>
        <div
          style={{
            width: 24,
            height: 3,
            background: '#1e6fa8',
            borderRadius: 1,
            marginTop: 2,
          }}
        />
      </div>
    ),
    { ...size },
  )
}
