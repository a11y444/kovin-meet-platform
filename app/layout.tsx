import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SessionProvider } from '@/components/providers/session-provider'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
})

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: {
    default: 'KOVIN Meet - Enterprise Video Conferencing',
    template: '%s | KOVIN Meet',
  },
  description: 'Self-hosted, white-label video conferencing platform for enterprises. Secure meetings, events, and ticketing with full RBAC.',
  keywords: ['video conferencing', 'enterprise', 'self-hosted', 'white-label', 'meetings', 'webinar', 'events'],
  authors: [{ name: 'KOVIN' }],
  creator: 'KOVIN',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'KOVIN Meet - Enterprise Video Conferencing',
    description: 'Self-hosted, white-label video conferencing platform for enterprises.',
    siteName: 'KOVIN Meet',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KOVIN Meet - Enterprise Video Conferencing',
    description: 'Self-hosted, white-label video conferencing platform for enterprises.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0a1628' },
    { media: '(prefers-color-scheme: dark)', color: '#0a1628' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable} bg-background`}>
      <body className="font-sans antialiased min-h-screen">
        <SessionProvider>
          {children}
        </SessionProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
