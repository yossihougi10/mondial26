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

  function update(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleRegister(e) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) {
      setError('הסיסמאות אינן תואמות')
      return
    }
    if (form.password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים')
      return
    }
    if (!form.displayName.trim()) {
      setError('נא להזין שם תצוגה')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { display_name: form.displayName.trim() } },
    })

    if (error) {
      setError(error.message === 'User already registered' ? 'אימייל זה כבר רשום' : 'שגיאה בהרשמה')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">⚽</div>
          <h1 className="text-3xl font-bold text-white">מונדיאל 2026</h1>
          <p className="text-green-300 mt-1">הצטרפו למשחק הניחושים</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">הרשמה</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">שם תצוגה</label>
              <input
                type="text"
                value={form.displayName}
                onChange={update('displayName')}
                required
                maxLength={30}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="השם שיוצג בלוח הניקוד"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">אימייל</label>
              <input
                type="email"
                value={form.email}
                onChange={update('email')}
                required
                className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="your@email.com"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">סיסמה</label>
              <input
                type="password"
                value={form.password}
                onChange={update('password')}
                required
                minLength={6}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="לפחות 6 תווים"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">אימות סיסמה</label>
              <input
                type="password"
                value={form.confirm}
                onChange={update('confirm')}
                required
                className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="חזור על הסיסמה"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? 'נרשם...' : 'הרשמה'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-4">
            כבר רשום?{' '}
            <Link href="/login" className="text-green-600 font-semibold hover:underline">
              כניסה
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
