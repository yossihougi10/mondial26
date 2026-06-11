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
      if (data.success) {
        onSyncMatches?.()
        alert(`סונכרנו ${data.matchCount} משחקים`)
      }
    } catch {
      alert('שגיאה בסנכרון')
    }
    setSyncing(false)
  }

  const navLinks = [
    { href: '/dashboard', label: 'לוח משחקים', icon: '⚽' },
    { href: '/leaderboard', label: 'דירוג', icon: '🏆' },
  ]

  if (profile?.is_admin) {
    navLinks.push({ href: '/admin', label: 'אדמין', icon: '⚙️' })
  }

  return (
    <nav className="bg-green-800 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* לוגו */}
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
            <span>⚽</span>
            <span className="hidden sm:block">מונדיאל 2026</span>
          </Link>

          {/* ניווט דסקטופ */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-white/20 text-white'
                    : 'text-green-100 hover:bg-white/10'
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* ימין - משתמש */}
          <div className="flex items-center gap-2">
            {profile?.is_admin && (
              <button
                onClick={handleSync}
                disabled={syncing}
                className="hidden sm:flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors"
              >
                <span>{syncing ? '⏳' : '🔄'}</span>
                <span>{syncing ? 'מסנכרן...' : 'סנכרן'}</span>
              </button>
            )}

            <span className="hidden sm:block text-sm text-green-200">
              {profile?.display_name}
            </span>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10"
            >
              <span className="text-xl">{menuOpen ? '✕' : '☰'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="hidden md:block text-xs text-green-300 hover:text-white transition-colors"
            >
              יציאה
            </button>
          </div>
        </div>

        {/* תפריט מובייל */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-green-700 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg font-medium ${
                  pathname === link.href
                    ? 'bg-white/20'
                    : 'text-green-100 hover:bg-white/10'
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}

            {profile?.is_admin && (
              <button
                onClick={() => { handleSync(); setMenuOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-green-100 hover:bg-white/10"
              >
                <span>🔄</span>
                <span>סנכרן משחקים</span>
              </button>
            )}

            <div className="flex items-center justify-between px-3 pt-2 border-t border-green-700 mt-2">
              <span className="text-sm text-green-200">{profile?.display_name}</span>
              <button onClick={handleLogout} className="text-sm text-green-300 hover:text-white">
                יציאה
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
