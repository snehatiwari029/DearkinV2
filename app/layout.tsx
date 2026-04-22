import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Dearkin — Financial Planning for Working Parents',
  description:
    'Know your numbers before your leave. WA PFML calculator with employer top-up data, STD stacking, and a week-by-week income timeline.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dearkin.com'),
  openGraph: {
    title: 'Dearkin — Financial Planning for Working Parents',
    description:
      'Know your numbers before your leave. WA PFML calculator with employer top-up data, STD stacking, and a week-by-week income timeline.',
    siteName: 'Dearkin',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-parchment text-ink font-sans antialiased">
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
