import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'FastTable - Create Your Restaurant',
  description: 'Create and manage your restaurant with an interactive menu and booking system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>
        <main className="min-h-screen bg-white">
          {children}
        </main>
      </body>
    </html>
  )
} 