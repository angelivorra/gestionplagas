import type { Metadata } from 'next'
import ThemeRegistry from '@/components/theme-registry'
import './globals.css'

export const metadata: Metadata = {
  title: 'SACEBA - Gestión de Plagas',
  description: 'Gestión de visitas y partes de trabajo para SACEBA Control de Plagas',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  )
}
