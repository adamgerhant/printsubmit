import './styles.scss'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Print Submit',
  description: 'Collect and manage 3D print submissions with a customizeable submission form and emails',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="en">
      <body className={inter.className}> 
          
          {children}
      </body>
    </html>
  )
}
