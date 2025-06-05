"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"

export default function Navbar() {
  const pathname = usePathname()
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  })

  // Refs for each nav item
  const emailRef = useRef<HTMLAnchorElement>(null)
  const mediaRef = useRef<HTMLAnchorElement>(null)
  const analysisRef = useRef<HTMLAnchorElement>(null)
  const seoRef = useRef<HTMLAnchorElement>(null)
  const notionRef = useRef<HTMLAnchorElement>(null)

  // Update indicator position based on active link
  useEffect(() => {
    let activeRef = null

    if (pathname === "/email-trackout") {
      activeRef = emailRef.current
    } else if (pathname === "/content-generation") {
      activeRef = mediaRef.current
    } else if (pathname === "/competitive-analysis") {
      activeRef = analysisRef.current
    } else if (pathname === "/website-seo") {
      activeRef = seoRef.current
    } else if (pathname === "/notion-trackout") {
      activeRef = notionRef.current
    }

    if (activeRef) {
      const { offsetLeft, offsetWidth } = activeRef
      setIndicatorStyle({
        left: offsetLeft,
        width: offsetWidth,
        opacity: 1,
      })
    } else {
      setIndicatorStyle({
        ...indicatorStyle,
        opacity: 0,
      })
    }
  }, [pathname])

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-sm border-b border-gray-800 shadow-sm">
      <div className="container mx-auto py-4 px-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="size-10 rounded-full bg-gradient-to-r from-violet-600 to-cyan-400 flex items-center justify-center">
              <span className="font-bold text-xl">A</span>
            </div>
            <span className="font-bold text-xl">Aura Growth</span>
          </Link>
          <nav className="flex items-center gap-6 relative">
            <Link
              ref={emailRef}
              href="/email-trackout"
              className={`transition-colors py-1 ${
                isActive("/email-trackout")
                  ? "text-white font-medium bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Email Trackout
            </Link>
            <Link
              ref={mediaRef}
              href="/content-generation"
              className={`transition-colors py-1 ${
                isActive("/content-generation")
                  ? "text-white font-medium bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Media Manager
            </Link>
            <Link
              ref={analysisRef}
              href="/competitive-analysis"
              className={`transition-colors py-1 ${
                isActive("/competitive-analysis")
                  ? "text-white font-medium bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Competitive Analysis
            </Link>
            <Link
              ref={seoRef}
              href="/website-seo"
              className={`transition-colors py-1 ${
                isActive("/website-seo")
                  ? "text-white font-medium bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Website SEO
            </Link>
            <Link
              ref={notionRef}
              href="/notion-trackout"
              className={`transition-colors py-1 ${
                isActive("/notion-trackout")
                  ? "text-white font-medium bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Notion Trackout
            </Link>

            {/* Animated underline indicator */}
            <div
              className="absolute bottom-0 h-0.5 bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-300 ease-in-out"
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
                opacity: indicatorStyle.opacity,
              }}
            />
          </nav>
        </div>
      </div>
    </header>
  )
}

