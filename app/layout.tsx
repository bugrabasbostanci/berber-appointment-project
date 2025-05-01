import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/features/auth/providers/auth-provider"

import { ThemeProvider } from "@/features/theme/providers/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  // 1) Title template ile sayfa bazlı başlık + marka :contentReference[oaicite:0]{index=0}
  title: {
    template: '%s | The Barber Shop',
    default: 'The Barber Shop – Men’s Club',
  },

//   // 2) Description: 120–155 karakter aralığında, kullanıcıya net açıklama :contentReference[oaicite:1]{index=1}
//   description: 'Erkeklere özel, mobil uyumlu Next.js berber randevu sistemi. The Barber Shop Men’s Club ile kolay saç kesimi ve sakal bakımı randevusu alın.',
  
//   // 3) Keywords: en fazla 10 öbek, aşırıya kaçmayın :contentReference[oaicite:2]{index=2} :contentReference[oaicite:3]{index=3}
//   keywords: [
//     'berber randevu',
//     'erkek berber',
//     'mobil randevu',
//     'saç kesim randevusu',
//     'sakal bakımı',
//     'The Barber Shop',
//     'Men’s Club',
//     'Next.js berber',
//     'online rezervasyon',
//     'erkek bakım'
//   ],
  
//   authors: [{ name: 'Bugra Basbostanci', url: 'https://bugrabasbostanci.com' }],
//   generator: 'Bugra Basbostanci',
//   robots: 'index, follow',
//   viewport: 'width=device-width, initial-scale=1',

//   // 4) Canonical URL: çoğaltılmış içerik sorunlarını önler :contentReference[oaicite:4]{index=4}
//   alternates: {
//     canonical: 'https://your-domain.com',  // canlı domain eklenecek
//   },

//   // 5) theme-color: mobil tarayıcı üst çubuğu için :contentReference[oaicite:5]{index=5}
//   themeColor: [
//     { media: '(prefers-color-scheme: light)', color: '#ffffff' },
//     { media: '(prefers-color-scheme: dark)',  color: '#000000' }
//   ],


//   // 6) Icons & PWA manifest :contentReference[oaicite:6]{index=6}
//   icons: {
//     icon: '/favicon.ico',
//     shortcut: '/icons/icon-192.png',
//     apple: '/icons/apple-touch-icon.png',
//   },
//   manifest: '/site.webmanifest',

  
// // 7) Open Graph: sosyal ağlarda zengin önizleme :contentReference[oaicite:7]{index=7}
//   openGraph: {
//     title: 'The Barber Shop – Men’s Club',
//     description: 'Erkeklere özel, mobil uyumlu Next.js berber randevu sistemi. Kolay saç kesimi ve sakal bakımı randevusu alın.',
//     url: 'https://your-domain.com',
//     siteName: 'The Barber Shop',
//     type: 'website',
//     locale: 'tr-TR',
//     images: [
//       {
//         url: 'https://your-domain.com/og-image.png',
//         width: 1200,
//         height: 630,
//         alt: 'The Barber Shop Men’s Club Randevu Sistemi',
//       }
//     ]
//   },

//   // 8) Twitter Card: geniş resimli önizleme :contentReference[oaicite:8]{index=8} :contentReference[oaicite:9]{index=9}
//   twitter: {
//     card: 'summary_large_image',
//     title: 'The Barber Shop – Men’s Club',
//     description: 'Erkeklere özel, mobil uyumlu Next.js berber randevu sistemi. Kolay randevu alın.',
//     images: ['https://your-domain.com/og-image.png'],
//     site: '@your_twitter_handle',
//     creator: '@your_twitter_handle'
//   }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
