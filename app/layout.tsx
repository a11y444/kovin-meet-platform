import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { SessionProvider } from '@/components/providers/session-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { I18nProvider } from '@/components/providers/i18n-provider'
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
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
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
    <html lang="en" className={`${inter.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('kovin-theme') || 'system';
                const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const resolved = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;
                document.documentElement.classList.add(resolved);
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased min-h-screen bg-background text-foreground">
        <ThemeProvider>
          <I18nProvider>
            <SessionProvider>
              {children}
            </SessionProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
