import Link from "next/link"
import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Aura Growth",
  description:
    "Aura Growth provides powerful tools designed specifically for early-stage startups to scale quickly and efficiently.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-black text-white`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <footer className="bg-gray-950 py-12">
              <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <div className="flex items-center gap-2 mb-6 md:mb-0">
                    <div className="size-8 rounded-full bg-gradient-to-r from-violet-600 to-cyan-400 flex items-center justify-center">
                      <span className="font-bold text-sm">A</span>
                    </div>
                    <span className="font-bold">Aura Growth</span>
                  </div>
                  <div className="flex gap-8 mb-6 md:mb-0">
                    <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                      Pricing
                    </Link>
                    <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                      About
                    </Link>
                    <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                      Contact
                    </Link>
                  </div>
                  <div className="text-gray-400 text-sm">
                    © {new Date().getFullYear()} Aura Growth. All rights reserved.
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'