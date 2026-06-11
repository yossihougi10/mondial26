'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'
import { isGroupStage } from '@/lib/scoring'

const STATUS_LABELS = {
  SCHEDULED: 'מתוכנן',
  IN_PLAY: 'חי',
  PAUSED: 'הפסקה',
  FINISHED: 'הסתיים',
  AWARDED: 'נפסק',
  POSTPONED: 'נדחה',
}

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [matches, setMatches] = useState([])
  const [users, setUsers] = useState([])
  const [allGuesses, setAllGuesses] = useState([])
  const [tab, setTab] = useState('matches') // 'matches' | 'guesses' | 'sync'
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  // Edit match state
  const [editMatch, setEditMatch] = useState(null)
  const [editForm, setEditForm] = useState({})

  // Enter guess state
  const [guessForm, setGuessForm] = useState({ user_id: '', match_id: '', prediction: '', home: '', away: '' })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()

      if (!prof?.is_admin) {
        router.push('/dashboard')
        return
      }

      setProfile(prof)

      const [matchRes, usersRes, guessRes] = await Promise.all([
        supabase.from('matches').select('*').order('utc_date', { ascending: true }),
        supabase.from('profiles').select('*').order('display_name'),
        supabase.from('guesses').select('*'),
      ])

      setMatches(matchRes.data || [])
      setUsers(usersRes.data || [])
      setAllGuesses(guessRes.data || [])
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line

  function flash(msg, isError = false) {
    setMessage(isError ? `❌ ${msg}` : `✅ ${msg}`)
    setTimeout(() => setMessage(''), 4000)
  }

  async function handleSync() {
    setSaving(true)
    try {
      const res = await fetch('/api/matches/sync', { method: 'POST' })
      const data = await res.json()
      if (data.success) flash(`סונכרנו ${data.matchCount} משחקים, ניקוד חושב ל-${data.scored}`)
      else flash(data.error || 'שגיאה', true)
    } catch { flash('שגיאת רשת', true) }
    setSaving(false)
  }

  async function handleRecalculate() {
    setSaving(true)
    try {
      const res = await fetch('/api/scores', { method: 'POST' })
      const data = await res.json()
      if (data.success) flash(`חושב מחדש ניקוד ל-${data.totalScored} ניחושים`)
      else flash(data.error || 'שגיאה', true)
    } catch { flash('שגיאת רשת', true) }
    setSaving(false)
  }

  function startEdit(match) {
    setEditMatch(match)
    setEditForm({
      home_score_full: match.home_score_full ?? '',
      away_score_full: match.away_score_full ?? '',
      status: match.status,
      winner: match.winner || '',
    })
  }

  async function saveMatchEdit() {
    if (!editMatch) return
    setSaving(true)
    try {
      const body = {
        id: editMatch.id,
        home_score_full: editForm.home_score_full !== '' ? parseInt(editForm.home_score_full) : null,
        away_score_full: editForm.away_score_full !== '' ? parseInt(editForm.away_score_full) : null,
        status: editForm.status,
        winner: editForm.winner || null,
      }
      const res = await fetch('/api/matches', { method: 'PATCH', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } })
      const data = await res.json()
      if (data.success) {
        setMatches(ms => ms.map(m => m.id === editMatch.id ? { ...m, ...body } : m))
        setEditMatch(null)
        flash('המשחק עודכן')
      } else flash(data.error || 'שגיאה', true)
    } catch { flash('שגיאת רשת', true) }
    setSaving(false)
  }

  async function saveGuess() {
    const { user_id, match_id, prediction, home, away } = guessForm
    if (!user_id || !match_id) { flash('בחר משתמש ומשחק', true); return }

    const match = matches.find(m => m.id === parseInt(match_id))
    const groupStage = match && isGroupStage(match.stage)

    if (groupStage && !prediction) { flash('בחר 1/X/2', true); return }
    if (!groupStage && (home === '' || away === '')) { flash('הזן תוצאה', true); return }

    setSaving(true)
    try {
      const body = {
        user_id,
        match_id: parseInt(match_id),
        prediction: groupStage ? prediction : null,
        predicted_home_score: !groupStage ? parseInt(home) : null,
        predicted_away_score: !groupStage ? parseInt(away) : null,
      }
      const res = await fetch('/api/guesses', { method: 'PUT', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } })
      const data = await res.json()
      if (data.success) {
        flash('הניחוש נשמר')
        setGuessForm({ user_id: '', match_id: '', prediction: '', home: '', away: '' })
        const guessRes = await supabase.from('guesses').select('*')
        setAllGuesses(guessRes.data || [])
      } else flash(data.error || 'שגיאה', true)
    } catch { flash('שגיאת רשת', true) }
    setSaving(false)
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-5xl animate-spin">⚽</div></div>
  }

  const selectedMatch = guessForm.match_id ? matches.find(m => m.id === parseInt(guessForm.match_id)) : null
  const groupStageGuess = selectedMatch ? isGroupStage(selectedMatch.stage) : true

  return (
    <>
      <Navbar profile={profile} onSyncMatches={() => { }} />
      <main className="max-w-3xl mx-auto px-3 py-4">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">⚙️ פאנל אדמין</h1>

        {message && (
          <div className={`rounded-lg p-3 mb-4 text-sm font-medium ${message.startsWith('❌') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        {/* טאבים */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-4">
          {[
            { id: 'sync', label: '🔄 סנכרון' },
            { id: 'matches', label: '⚽ משחקים' },
            { id: 'guesses', label: '🎯 ניחושים' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* טאב סנכרון */}
        {tab === 'sync' && (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-1">סנכרון מה-API</h3>
              <p className="text-sm text-slate-500 mb-3">מושך משחקים מ-football-data.org, נועל ניחושים ומחשב ניקוד</p>
              <button
                onClick={handleSync}
                disabled={saving}
                className="w-full bg-green-600 text-white font-semibold py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? 'מסנכרן...' : '🔄 סנכרן משחקים'}
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-1">חישוב ניקוד מחדש</h3>
              <p className="text-sm text-slate-500 mb-3">מחשב ניקוד מחדש לכל המשחקים שהסתיימו</p>
              <button
                onClick={handleRecalculate}
                disabled={saving}
                className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'מחשב...' : '📊 חשב ניקוד מחדש'}
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <p className="font-semibold mb-1">📋 סטטיסטיקות</p>
              <p>סה"כ משחקים: {matches.length}</p>
              <p>שהסתיימו: {matches.filter(m => m.status === 'FINISHED').length}</p>
              <p>חיים: {matches.filter(m => m.status === 'IN_PLAY').length}</p>
              <p>ניחושים שהוזנו: {allGuesses.length}</p>
              <p>משתמשים: {users.length}</p>
            </div>
          </div>
        )}

        {/* טאב משחקים */}
        {tab === 'matches' && (
          <div className="space-y-2">
            {editMatch && (
              <div className="bg-white rounded-xl border-2 border-green-500 p-4 shadow-md mb-4">
                <h3 className="font-semibold text-slate-800 mb-3">
                  עריכה: {editMatch.home_team_name} - {editMatch.away_team_name}
                </h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">גולים בית</label>
                    <input type="number" min="0" max="20"
                      value={editForm.home_score_full}
                      onChange={e => setEditForm(f => ({ ...f, home_score_full: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-center text-lg font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">גולים אורח</label>
                    <input type="number" min="0" max="20"
                      value={editForm.away_score_full}
                      onChange={e => setEditForm(f => ({ ...f, away_score_full: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-center text-lg font-bold"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">סטטוס</label>
                    <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2">
                      {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">מנצח</label>
                    <select value={editForm.winner} onChange={e => setEditForm(f => ({ ...f, winner: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2">
                      <option value="">—</option>
                      <option value="HOME_TEAM">בית</option>
                      <option value="AWAY_TEAM">אורח</option>
                      <option value="DRAW">תיקו</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={saveMatchEdit} disabled={saving}
                    className="flex-1 bg-green-600 text-white font-semibold py-2 rounded-lg hover:bg-green-700 disabled:opacity-50">
                    {saving ? 'שומר...' : 'שמור'}
                  </button>
                  <button onClick={() => setEditMatch(null)}
                    className="flex-1 bg-slate-100 text-slate-700 font-semibold py-2 rounded-lg hover:bg-slate-200">
                    ביטול
                  </button>
                </div>
              </div>
            )}

            {matches.map(match => {
              const matchGuessCount = allGuesses.filter(g => g.match_id === match.id).length
              return (
                <div key={match.id} className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-800 text-sm truncate">
                      {match.home_team_name} - {match.away_team_name}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-500">
                        {new Date(match.utc_date).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        match.status === 'FINISHED' ? 'bg-slate-100 text-slate-600' :
                        match.status === 'IN_PLAY' ? 'bg-red-100 text-red-700' :
                        'bg-blue-50 text-blue-600'
                      }`}>
                        {STATUS_LABELS[match.status] || match.status}
                      </span>
                      {match.home_score_full !== null && (
                        <span className="text-xs font-bold text-slate-700">
                          {match.home_score_full}-{match.away_score_full}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">{matchGuessCount} ניחושים</span>
                    </div>
                  </div>
                  <button
                    onClick={() => startEdit(match)}
                    className="shrink-0 text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg font-medium"
                  >
                    ✏️ עריכה
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* טאב ניחושים */}
        {tab === 'guesses' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-3">הזן ניחוש עבור שחקן</h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">שחקן</label>
                  <select
                    value={guessForm.user_id}
                    onChange={e => setGuessForm(f => ({ ...f, user_id: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">בחר שחקן...</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.display_name} ({u.email})</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-500 block mb-1">משחק</label>
                  <select
                    value={guessForm.match_id}
                    onChange={e => setGuessForm(f => ({ ...f, match_id: e.target.value, prediction: '', home: '', away: '' }))}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">בחר משחק...</option>
                    {matches.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.home_team_name} - {m.away_team_name} ({new Date(m.utc_date).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedMatch && groupStageGuess && (
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">ניחוש (שלב בתים)</label>
                    <div className="flex gap-2">
                      {['1', 'X', '2'].map(opt => (
                        <button key={opt}
                          onClick={() => setGuessForm(f => ({ ...f, prediction: opt }))}
                          className={`flex-1 py-2.5 rounded-lg font-bold border-2 text-sm ${
                            guessForm.prediction === opt ? 'border-green-500 bg-green-500 text-white' : 'border-slate-200'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2 text-xs text-slate-400 mt-1">
                      <span className="flex-1 text-center">בית</span>
                      <span className="flex-1 text-center">תיקו</span>
                      <span className="flex-1 text-center">אורח</span>
                    </div>
                  </div>
                )}

                {selectedMatch && !groupStageGuess && (
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">תוצאה (נוקאאוט)</label>
                    <div className="flex items-center gap-2 justify-center">
                      <input type="number" min="0" max="20"
                        value={guessForm.home}
                        onChange={e => setGuessForm(f => ({ ...f, home: e.target.value }))}
                        className="w-16 h-12 text-center text-xl font-bold border-2 rounded-lg"
                        placeholder="0"
                      />
                      <span className="text-slate-400 font-bold">-</span>
                      <input type="number" min="0" max="20"
                        value={guessForm.away}
                        onChange={e => setGuessForm(f => ({ ...f, away: e.target.value }))}
                        className="w-16 h-12 text-center text-xl font-bold border-2 rounded-lg"
                        placeholder="0"
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={saveGuess}
                  disabled={saving || !guessForm.user_id || !guessForm.match_id}
                  className="w-full bg-green-600 text-white font-semibold py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? 'שומר...' : 'שמור ניחוש'}
                </button>
              </div>
            </div>

            {/* רשימת ניחושים קיימים */}
            <div>
              <h3 className="font-semibold text-slate-700 mb-2">ניחושים קיימים ({allGuesses.length})</h3>
              <div className="space-y-1.5 max-h-96 overflow-y-auto">
                {allGuesses.map(g => {
                  const match = matches.find(m => m.id === g.match_id)
                  const user = users.find(u => u.id === g.user_id)
                  const guessText = g.prediction || (g.predicted_home_score !== null ? `${g.predicted_home_score}-${g.predicted_away_score}` : '—')
                  return (
                    <div key={g.id} className="bg-white rounded-lg border border-slate-100 px-3 py-2 text-sm flex items-center justify-between">
                      <span className="text-slate-700 truncate">
                        <span className="font-medium">{user?.display_name}</span>
                        <span className="text-slate-400 mx-1">|</span>
                        <span>{match?.home_team_name} - {match?.away_team_name}</span>
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold text-green-700">{guessText}</span>
                        {g.is_locked && <span className="text-xs">🔒</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
