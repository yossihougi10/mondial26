'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Navbar({ profile, onSyncMatches }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [menuOpen, setMenuOpen] = useState(false)
  const [syncing, setSyncing] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  async function handleSync() {
    setSyncing(true)
    try {
      const res = await fetch('/api/matches/sync', { method: 'POST' })
      const data = await res.json()
      if (data.success) { onSyncMatches?.(); alert(`✅ סונכרנו ${data.matchCount} משחקים`) }
    } catch { alert('שגיאה בסנכרון') }
    setSyncing(false)
  }

  const navLinks = [
    { href: '/dashboard', label: 'משחקים', icon: '⚽' },
    { href: '/special',   label: 'בחירות מיוחדות', icon: '⭐' },
    { href: '/leaderboard', label: 'דירוג', icon: '🏆' },
    ...(profile?.is_admin ? [{ href: '/admin', label: 'אדמין', icon: '⚙️' }] : []),
  ]

  return (
    <nav className="sticky top-0 z-50"
      style={{
        background: 'rgba(5,11,22,0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 4px 32px rgba(0,0,0,0.5)',
      }}>
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* ─── Logo ─────────────────────────────── */}
          <Link href="/dashboard" className="flex items-center gap-2.5 select-none">
            <span className="text-2xl">⚽</span>
            <div className="hidden sm:flex items-baseline gap-1">
              <span className="text-[17px] font-black text-white tracking-tight">מונדיאל</span>
              <span className="text-[17px] font-black neon-text">2026</span>
            </div>
          </Link>

          {/* ─── Desktop nav ──────────────────────── */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => {
              const active = pathname === link.href
              return (
                <Link key={link.href} href={link.href}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-bold transition-all duration-200 ${
                    active
                      ? 'text-green-400 border'
                      : 'text-[#94A3B8] hover:text-white hover:bg-white/8 border border-transparent'
                  }`}
                  style={active ? {
                    background: 'rgba(34,197,94,0.12)',
                    borderColor: 'rgba(34,197,94,0.38)',
                    boxShadow: '0 0 14px rgba(34,197,94,0.18)',
                  } : {}}>
                  <span className="text-sm">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </div>

          {/* ─── Right side ───────────────────────── */}
          <div className="flex items-center gap-2">
            {profile?.is_admin && (
              <button onClick={handleSync} disabled={syncing}
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  color: '#94A3B8',
                }}
                onMouseEnter={e => { e.currentTarget.style.color='#fff'; e.currentTarget.style.background='rgba(255,255,255,0.10)' }}
                onMouseLeave={e => { e.currentTarget.style.color='#94A3B8'; e.currentTarget.style.background='rgba(255,255,255,0.06)' }}>
                <span className={syncing ? 'animate-spin' : ''}>{syncing ? '⏳' : '🔄'}</span>
                <span>סנכרן</span>
              </button>
            )}

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)' }}>
              <div className="w-5 h-5 rounded-full bg-green-500/30 border border-green-500/40 flex items-center justify-center text-[9px] font-black text-green-400">
                {profile?.display_name?.slice(0,1).toUpperCase()}
              </div>
              <span className="text-[13px] font-semibold text-[#94A3B8]">{profile?.display_name}</span>
            </div>

            <button onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg transition-all text-[#94A3B8] hover:text-white hover:bg-white/8">
              <span className="text-lg">{menuOpen ? '✕' : '☰'}</span>
            </button>

            <button onClick={handleLogout}
              className="hidden md:block text-xs text-[#94A3B8]/60 hover:text-red-400/80 transition-colors px-2">
              יציאה
            </button>
          </div>
        </div>

        {/* ─── Mobile menu ──────────────────────── */}
        {menuOpen && (
          <div className="md:hidden py-3 space-y-0.5" style={{ borderTop:'1px solid rgba(255,255,255,0.07)' }}>
            {navLinks.map(link => {
              const active = pathname === link.href
              return (
                <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    active ? 'text-green-400' : 'text-[#94A3B8] hover:text-white hover:bg-white/8'
                  }`}
                  style={active ? { background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.30)' } : {}}>
                  <span>{link.icon}</span><span>{link.label}</span>
                </Link>
              )
            })}
            {profile?.is_admin && (
              <button onClick={() => { handleSync(); setMenuOpen(false) }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#94A3B8] hover:text-white hover:bg-white/8 transition-all">
                <span>🔄</span><span>סנכרן משחקים</span>
              </button>
            )}
            <div className="flex items-center justify-between px-3 pt-3 mt-1"
              style={{ borderTop:'1px solid rgba(255,255,255,0.07)' }}>
              <span className="text-sm text-[#94A3B8]">{profile?.display_name}</span>
              <button onClick={handleLogout} className="text-sm text-[#94A3B8]/50 hover:text-red-400 transition-colors">יציאה</button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
