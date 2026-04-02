import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'

// NB International Pro (source font) is a commercial typeface by Neubau Berlin.
// DM Sans is the closest freely available geometric grotesque match.
// To use the real font: add font files to /public/fonts/ and switch to next/font/local.
const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  axes: ['opsz'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Pace — AI Running Coach',
  description:
    'Personalized running coaching powered by your Garmin data and evidence-based training methodology.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className="font-sans bg-white text-zinc-900">{children}</body>
    </html>
  )
}
