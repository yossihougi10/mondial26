'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function GuessInput({ match, initialGuess, userId, onGuessChange }) {
  const supabase = createClient()
  const [guess, setGuess]   = useState(initialGuess || null)
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
    const hasExact = guess?.predicted_home_score !== null && guess?.predicted_home_score !== undefined
    return (
      <div className="flex items-center gap-2">
        <span className="text-white/20 text-xs">🔒</span>
        {hasExact ? (
          <span className="font-black text-white/70 px-3 py-1 rounded-lg text-sm"
            style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.10)' }}>
            {guess.predicted_home_score} – {guess.predicted_away_score}
          </span>
        ) : (
          <span className="text-[#94A3B8]/50 text-xs">לא ניחשת</span>
        )}
      </div>
    )
  }

  const homeVal = guess?.predicted_home_score ?? ''
  const awayVal = guess?.predicted_away_score ?? ''

  function handleChange(side, val) {
    const parsed = val === '' ? null : parseInt(val, 10)
    if (val !== '' && (isNaN(parsed) || parsed < 0 || parsed > 20)) return
    const newHome = side === 'home' ? parsed : (homeVal === '' ? null : parseInt(homeVal, 10))
    const newAway = side === 'away' ? parsed : (awayVal === '' ? null : parseInt(awayVal, 10))
    if (newHome !== null && newAway !== null) {
      saveGuess({ predicted_home_score: newHome, predicted_away_score: newAway })
    } else {
      setGuess(g => ({
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
