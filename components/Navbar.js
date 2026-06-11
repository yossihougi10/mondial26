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
    { href: '/special', label: 'בחירות מיוחדות', icon: '⭐' },
    { href: '/leaderboard', label: 'דירוג', icon: '🏆' },
    ...(profile?.is_admin ? [{ href: '/admin', label: 'אדמין', icon: '⚙️' }] : []),
  ]

  return (
    <nav style={{ background: 'rgba(8,12,24,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      className="sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* לוגו */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">⚽</span>
            <span className="font-black text-white hidden sm:block tracking-tight">
              מונדיאל <span className="gradient-text">2026</span>
            </span>
          </Link>

          {/* ניווט דסקטופ */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  pathname === link.href
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'text-white/60 hover:text-white hover:bg-white/8'
                }`}>
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* ימין */}
          <div className="flex items-center gap-2">
            {profile?.is_admin && (
              <button onClick={handleSync} disabled={syncing}
                className="hidden sm:flex items-center gap-1.5 text-xs bg-white/8 hover:bg-white/15 border border-white/10 px-3 py-1.5 rounded-lg text-white/70 hover:text-white transition-all">
                <span className={syncing ? 'animate-spin' : ''}>{syncing ? '⏳' : '🔄'}</span>
                <span>סנכרן</span>
              </button>
            )}
            <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              <span className="text-sm text-white/70 font-medium">{profile?.display_name}</span>
            </div>
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/8 transition-all">
              <span className="text-xl">{menuOpen ? '✕' : '☰'}</span>
            </button>
            <button onClick={handleLogout}
              className="hidden md:block text-xs text-white/30 hover:text-white/70 transition-colors px-2">
              יציאה
            </button>
          </div>
        </div>

        {/* מובייל */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-white/8 space-y-1">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium transition-all ${
                  pathname === link.href ? 'bg-green-500/20 text-green-400' : 'text-white/60 hover:text-white hover:bg-white/8'
                }`}>
                <span>{link.icon}</span><span>{link.label}</span>
              </Link>
            ))}
            {profile?.is_admin && (
              <button onClick={() => { handleSync(); setMenuOpen(false) }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/8 transition-all">
                <span>🔄</span><span>סנכרן משחקים</span>
              </button>
            )}
            <div className="flex items-center justify-between px-3 pt-3 mt-2 border-t border-white/8">
              <span className="text-sm text-white/50">{profile?.display_name}</span>
              <button onClick={handleLogout} className="text-sm text-white/40 hover:text-red-400 transition-colors">יציאה</button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
