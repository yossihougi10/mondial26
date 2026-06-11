'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

function getInitialMode(initialGuess, stage) {
  if (initialGuess?.prediction) return 'direction'
  if (initialGuess?.predicted_home_score !== null && initialGuess?.predicted_home_score !== undefined) return 'exact'
  return stage === 'GROUP_STAGE' ? 'direction' : 'exact'
}

export default function GuessInput({ match, initialGuess, userId, onGuessChange }) {
  const supabase = createClient()
  const [mode, setMode] = useState(() => getInitialMode(initialGuess, match.stage))
  const [guess, setGuess] = useState(initialGuess || null)
  const [saving, setSaving] = useState(false)

  const locked = false

  async function saveGuess(newGuess) {
    if (locked) return
    setSaving(true)
    const payload = {
      user_id: userId, match_id: match.id, is_locked: false, updated_at: new Date().toISOString(),
      prediction: null, predicted_home_score: null, predicted_away_score: null,
      ...newGuess,
    }
    const { error } = await supabase.from('guesses').upsert(payload, { onConflict: 'user_id,match_id' })
    if (!error) { setGuess(newGuess); onGuessChange?.(match.id, newGuess) }
    setSaving(false)
  }

  if (locked) {
    const hasDirection = guess?.prediction
    const hasExact = guess?.predicted_home_score !== null && guess?.predicted_home_score !== undefined
    const hasGuess = hasDirection || hasExact
    return (
      <div className="flex items-center gap-2">
        <span className="text-white/20 text-xs">🔒</span>
        {hasGuess ? (
          <span className="font-black text-white/70 px-3 py-1 rounded-lg text-sm"
            style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.10)' }}>
            {hasDirection
              ? guess.prediction
              : `${guess.predicted_home_score} – ${guess.predicted_away_score}`}
          </span>
        ) : (
          <span className="text-[#94A3B8]/50 text-xs">לא ניחשת</span>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {/* Mode toggle */}
      <div className="mode-toggle">
        <button onClick={() => setMode('direction')}
          className={`mode-tab${mode === 'direction' ? ' mode-tab-active' : ''}`}>
          1 / X / 2
        </button>
        <button onClick={() => setMode('exact')}
          className={`mode-tab${mode === 'exact' ? ' mode-tab-active' : ''}`}>
          תוצאה מדויקת
        </button>
      </div>

      {mode === 'direction'
        ? <DirectionInput guess={guess} saving={saving} onSave={saveGuess} />
        : <ExactScoreInput guess={guess} saving={saving} onSave={saveGuess} onSetGuess={setGuess} />
      }
    </div>
  )
}

function DirectionInput({ guess, saving, onSave }) {
  const labels = ['בית', 'תיקו', 'אורח']
  return (
    <div>
      <div className="flex gap-2">
        {['1', 'X', '2'].map(opt => (
          <button key={opt} disabled={saving} onClick={() => onSave({ prediction: opt })}
            className={`btn-pick${guess?.prediction === opt ? ' btn-pick-active' : ''}`}>
            {opt}
          </button>
        ))}
      </div>
      <div className="flex gap-2 mt-1.5 px-0.5">
        {labels.map(l => (
          <span key={l} className="flex-1 text-center text-[10px] font-medium"
            style={{ color:'rgba(148,163,184,0.50)' }}>{l}</span>
        ))}
      </div>
    </div>
  )
}

function ExactScoreInput({ guess, saving, onSave, onSetGuess }) {
  const homeVal = guess?.predicted_home_score ?? ''
  const awayVal = guess?.predicted_away_score ?? ''

  function handleChange(side, val) {
    const parsed = val === '' ? null : parseInt(val, 10)
    if (val !== '' && (isNaN(parsed) || parsed < 0 || parsed > 20)) return
    const newHome = side === 'home' ? parsed : (homeVal === '' ? null : parseInt(homeVal, 10))
    const newAway = side === 'away' ? parsed : (awayVal === '' ? null : parseInt(awayVal, 10))
    if (newHome !== null && newAway !== null) {
      onSave({ predicted_home_score: newHome, predicted_away_score: newAway })
    } else {
      onSetGuess(g => ({
        ...g,
        [side === 'home' ? 'predicted_home_score' : 'predicted_away_score']: parsed,
      }))
    }
  }

  return (
    <div className="flex items-center justify-center gap-3 py-0.5">
      <input type="number" min="0" max="20" value={homeVal}
        onChange={e => handleChange('home', e.target.value)}
        disabled={saving} placeholder="0"
        className="score-input" />
      <span className="font-black text-[#94A3B8]/40 text-xl select-none">—</span>
      <input type="number" min="0" max="20" value={awayVal}
        onChange={e => handleChange('away', e.target.value)}
        disabled={saving} placeholder="0"
        className="score-input" />
    </div>
  )
}
