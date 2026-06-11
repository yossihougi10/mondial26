'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('אימייל או סיסמה שגויים'); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-green-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-7xl mb-4" style={{ animation: 'float 3s ease-in-out infinite' }}>⚽</div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            מונדיאל <span className="gradient-text">2026</span>
          </h1>
          <p className="text-white/50 mt-2">ניחוש תוצאות עם החברים</p>
        </div>

        <div className="glass-bright rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6 text-center">כניסה</h2>

          {error && (
            <div className="bg-red-500/15 border border-red-500/30 text-red-400 rounded-xl p-3 mb-5 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">אימייל</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-green-500/60 focus:bg-white/8 transition-all"
                placeholder="your@email.com" dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">סיסמה</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-green-500/60 focus:bg-white/8 transition-all"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full bg-green-500 hover:bg-green-400 disabled:bg-green-500/40 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-green-500/25 hover:-translate-y-0.5 active:translate-y-0 mt-2"
            >
              {loading ? '...' : 'כניסה'}
            </button>
          </form>

          <p className="text-center text-sm text-white/40 mt-5">
            אין לך חשבון?{' '}
            <Link href="/register" className="text-green-400 font-semibold hover:text-green-300 transition-colors">הרשמה</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
