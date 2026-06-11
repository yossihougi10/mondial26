'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({ displayName: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field) { return e => setForm(f => ({ ...f, [field]: e.target.value })) }

  async function handleRegister(e) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('הסיסמאות אינן תואמות'); return }
    if (form.password.length < 6) { setError('הסיסמה חייבת להכיל לפחות 6 תווים'); return }
    if (!form.displayName.trim()) { setError('נא להזין שם תצוגה'); return }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { display_name: form.displayName.trim() } },
    })
    if (error) { setError('שגיאה בהרשמה'); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-green-500/60 transition-all"

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-green-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="text-7xl mb-4">⚽</div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            מונדיאל <span className="gradient-text">2026</span>
          </h1>
          <p className="text-white/50 mt-2">הצטרפו למשחק הניחושים</p>
        </div>

        <div className="glass-bright rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6 text-center">הרשמה</h2>

          {error && (
            <div className="bg-red-500/15 border border-red-500/30 text-red-400 rounded-xl p-3 mb-5 text-sm text-center">{error}</div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">שם תצוגה</label>
              <input type="text" value={form.displayName} onChange={update('displayName')} required maxLength={30}
                className={inputClass} placeholder="השם שיוצג בלוח הניקוד" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">אימייל</label>
              <input type="email" value={form.email} onChange={update('email')} required
                className={inputClass} placeholder="your@email.com" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">סיסמה</label>
              <input type="password" value={form.password} onChange={update('password')} required minLength={6}
                className={inputClass} placeholder="לפחות 6 תווים" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">אימות סיסמה</label>
              <input type="password" value={form.confirm} onChange={update('confirm')} required
                className={inputClass} placeholder="חזור על הסיסמה" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-green-500 hover:bg-green-400 disabled:bg-green-500/40 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-green-500/25 hover:-translate-y-0.5 mt-2">
              {loading ? '...' : 'הרשמה'}
            </button>
          </form>

          <p className="text-center text-sm text-white/40 mt-5">
            כבר רשום?{' '}
            <Link href="/login" className="text-green-400 font-semibold hover:text-green-300 transition-colors">כניסה</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
