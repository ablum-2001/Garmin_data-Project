'use client'

import { useState, useEffect } from 'react'

interface NavbarProps {
  onStartCoaching: () => void
  hasProfile: boolean
}

export function Navbar({ onStartCoaching, hasProfile }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 72)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isLight = scrolled

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 h-20 flex items-center justify-between px-6 md:px-10 transition-all duration-300 ${
        isLight
          ? 'bg-white/95 backdrop-blur-sm border-b border-zinc-200'
          : 'bg-transparent'
      }`}
    >
      {/* Logo */}
      <span
        className={`font-semibold tracking-tight text-xl transition-colors duration-300 ${
          isLight ? 'text-zinc-900' : 'text-white'
        }`}
      >
        pace
      </span>

      {/* Nav links */}
      <div
        className={`hidden md:flex items-center gap-8 text-sm transition-colors duration-300 ${
          isLight ? 'text-zinc-500' : 'text-white/60'
        }`}
      >
        <a
          href="#how-it-works"
          className={`transition-colors ${isLight ? 'hover:text-zinc-900' : 'hover:text-white'}`}
        >
          How it works
        </a>
        <button
          onClick={onStartCoaching}
          className={`transition-colors ${isLight ? 'hover:text-zinc-900' : 'hover:text-white'}`}
        >
          {hasProfile ? 'Your coach' : 'Get started'}
        </button>
      </div>

      {/* CTA */}
      <button
        onClick={onStartCoaching}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          isLight
            ? 'bg-primary-600 text-white hover:bg-primary-700'
            : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
        }`}
      >
        {hasProfile ? 'Open coach' : 'Meet the coach'}
      </button>
    </nav>
  )
}
