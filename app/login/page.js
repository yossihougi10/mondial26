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

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
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

          {/* Google button */}
          <button type="button" onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-bold text-white/90 transition-all hover:-translate-y-0.5 active:translate-y-0 mb-5"
            style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.14)' }}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            כניסה עם Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background:'rgba(255,255,255,0.09)' }} />
            <span className="text-xs font-medium" style={{ color:'rgba(255,255,255,0.28)' }}>או עם אימייל</span>
            <div className="flex-1 h-px" style={{ background:'rgba(255,255,255,0.09)' }} />
          </div>

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
