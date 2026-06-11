'use client'

import Image from 'next/image'
import GuessInput from './GuessInput'
import { getResultTypeLabel } from '@/lib/scoring'

const STAGE_LABELS = {
  GROUP_STAGE:   'שלב הבתים',
  ROUND_OF_32:   'שלב 32',
  ROUND_OF_16:   'שמינית גמר',
  QUARTER_FINALS:'רבע גמר',
  SEMI_FINALS:   'חצי גמר',
  THIRD_PLACE:   'גמר 3/4',
  FINAL:         '🏆 גמר',
}

function TeamFlag({ crest, name }) {
  return (
    <div className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center shrink-0"
      style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.10)' }}>
      {crest ? (
        <Image src={crest} alt={name} width={44} height={44}
          className="object-contain w-[80%] h-[80%]"
          onError={e => { e.target.style.display='none' }} />
      ) : (
        <span className="text-xs font-black text-white/40">{name?.slice(0,3).toUpperCase()}</span>
      )}
    </div>
  )
}

function ScoreBadge({ points, resultType }) {
  const { text, color } = getResultTypeLabel(resultType)
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg ${color}`}>
      +{points} נקודות · {text}
    </span>
  )
}

export default function MatchCard({ match, userGuess, allGuesses, profiles, userId, onGuessChange, userScore }) {
  const isLive     = match.status === 'IN_PLAY' || match.status === 'PAUSED'
  const isFinished = match.status === 'FINISHED'
  const isStarted  = isLive || isFinished

  const matchTime = new Date(match.utc_date).toLocaleTimeString('he-IL', {
    hour:'2-digit', minute:'2-digit', timeZone:'Asia/Jerusalem',
  })

  const stageLabel = STAGE_LABELS[match.stage] || match.stage
  const groupLabel = match.group_name
    ? ` · קבוצה ${match.group_name.replace('GROUP_', '')}`
    : ''

  // Card border/glow based on state
  const cardStyle = isLive ? {
    borderColor: 'rgba(239,68,68,0.45)',
    boxShadow: '0 0 28px rgba(239,68,68,0.10), 0 8px 32px rgba(0,0,0,0.35)',
  } : isFinished ? {
    borderColor: 'rgba(255,255,255,0.08)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
  } : {
    borderColor: 'rgba(255,255,255,0.09)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
  }

  return (
    <div className="glass rounded-[20px] border overflow-hidden transition-all duration-200 hover:translate-y-[-1px]"
      style={{ ...cardStyle, borderWidth:'1px', borderStyle:'solid' }}>

      {/* Live top stripe */}
      {isLive && (
        <div className="h-[3px]"
          style={{ background:'linear-gradient(90deg,transparent,#EF4444 30%,#F97316 70%,transparent)' }} />
      )}

      {/* ── Card header ──────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5"
        style={{ background:'rgba(255,255,255,0.025)', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>

        <div className="flex items-center gap-1.5">
          {isLive ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.30)' }}>
              <span className="live-dot w-1.5 h-1.5 bg-red-500 rounded-full inline-block" />
              <span className="text-[11px] font-black text-red-400 tracking-wide">חי</span>
            </div>
          ) : isFinished ? (
            <span className="text-[11px] font-semibold text-[#94A3B8]/60 px-2.5 py-1 rounded-full"
              style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>
              הסתיים
            </span>
          ) : (
            <span className="text-[11px] font-mono font-bold text-[#94A3B8] flex items-center gap-1">
              <span className="text-[9px] opacity-60">🕐</span>{matchTime}
            </span>
          )}
        </div>

        <span className="text-[11px] font-medium text-[#94A3B8]/60">{stageLabel}{groupLabel}</span>
      </div>

      {/* ── Teams & Score ─────────────────────────── */}
      <div className="px-5 py-5">
        <div className="flex items-center gap-3">

          {/* Home */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <TeamFlag crest={match.home_team_crest} name={match.home_team_name} />
            <span className="text-[15px] font-black text-white leading-tight truncate">
              {match.home_team_short || match.home_team_name}
            </span>
          </div>

          {/* Score / VS */}
          <div className="text-center shrink-0 px-1">
            {isStarted ? (
              <div className="text-[36px] font-black leading-none tracking-tight"
                style={{ color: isLive ? '#fff' : 'rgba(248,250,252,0.90)' }}>
                {match.home_score_full ?? '?'}
                <span className="text-white/20 mx-1.5 font-light">:</span>
                {match.away_score_full ?? '?'}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[11px] font-black tracking-[0.25em] text-white/15">VS</span>
              </div>
            )}
            {isFinished && match.home_score_penalties !== null && (
              <div className="text-[10px] text-[#94A3B8]/50 text-center mt-1">
                פנ' {match.home_score_penalties}:{match.away_score_penalties}
              </div>
            )}
          </div>

          {/* Away */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end">
            <span className="text-[15px] font-black text-white leading-tight truncate text-end">
              {match.away_team_short || match.away_team_name}
            </span>
            <TeamFlag crest={match.away_team_crest} name={match.away_team_name} />
          </div>
        </div>

        {/* ── Guess section ──────────────────────── */}
        <div className="mt-4 pt-4" style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-start gap-3">
            <span className="text-[11px] font-semibold text-[#94A3B8]/50 shrink-0 mt-[14px] leading-none">
              הניחוש שלי
            </span>
            <div className="flex-1">
              <GuessInput match={match} initialGuess={formatGuess(userGuess)}
                userId={userId} onGuessChange={onGuessChange} />
            </div>
          </div>

          {isFinished && userScore !== undefined && (
            <div className="mt-2.5">
              {userScore
                ? <ScoreBadge points={userScore.points} resultType={userScore.result_type} />
                : <span className="text-[11px] text-[#94A3B8]/40">לא ניחשת</span>
              }
            </div>
          )}
        </div>
      </div>

      {/* ── Friends' guesses ──────────────────────── */}
      {isStarted && allGuesses && allGuesses.length > 0 && (
        <div className="px-5 pb-5" style={{ borderTop:'1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-[11px] font-semibold text-[#94A3B8]/45 pt-3.5 mb-2.5">ניחושי כולם</p>
          <div className="grid grid-cols-2 gap-1.5">
            {allGuesses.map(g => {
              const p = profiles?.find(x => x.id === g.user_id)
              const name = p?.display_name || '?'
              const guessText = g.prediction
                ? g.prediction
                : (g.predicted_home_score !== null && g.predicted_home_score !== undefined)
                  ? `${g.predicted_home_score}:${g.predicted_away_score}`
                  : '—'
              const isMe = g.user_id === userId
              return (
                <div key={g.id}
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-all"
                  style={isMe ? {
                    background:'rgba(34,197,94,0.10)',
                    border:'1px solid rgba(34,197,94,0.25)',
                  } : {
                    background:'rgba(255,255,255,0.04)',
                    border:'1px solid rgba(255,255,255,0.07)',
                  }}>
                  <span className={`font-semibold truncate ${isMe ? 'text-green-400' : 'text-[#94A3B8]/70'}`}>
                    {isMe ? `${name} ✓` : name}
                  </span>
                  <span className={`font-black mr-2 shrink-0 text-sm ${isMe ? 'text-green-300' : 'text-white/80'}`}>
                    {guessText}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function formatGuess(guess) {
  if (!guess) return null
  return {
    prediction: guess.prediction,
    predicted_home_score: guess.predicted_home_score,
    predicted_away_score: guess.predicted_away_score,
  }
}
