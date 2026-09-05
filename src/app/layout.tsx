// src/app/layout.tsx
import type { Metadata, Viewport } from 'next'
import '@/styles/globals.css'
import { AuthProvider } from '@/lib/auth-context'

export const metadata: Metadata = {
  title:       'campus-edu',
  description: 'Accédez à vos cours et sujets d\'examen',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  icons: [
    { rel: 'icon', url: '/favicon.ico' },
    { rel: 'icon', url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    { rel: 'icon', url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    { rel: 'apple-touch-icon', url: '/icon-192.png', sizes: '192x192' },
  ],
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#0d6efd',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
