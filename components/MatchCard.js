'use client'

import Image from 'next/image'
import GuessInput from './GuessInput'
import { isGroupStage, getResultTypeLabel } from '@/lib/scoring'

const STAGE_LABELS = {
  GROUP_STAGE: 'שלב הבתים', ROUND_OF_32: 'שמינית גמר', ROUND_OF_16: 'שמינית גמר',
  QUARTER_FINALS: 'רבע גמר', SEMI_FINALS: 'חצי גמר', THIRD_PLACE: 'גמר 3/4', FINAL: 'גמר 🏆',
}

function TeamFlag({ crest, name }) {
  if (crest) {
    return (
      <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
        <Image src={crest} alt={name} width={40} height={40} className="object-contain w-full h-full"
          onError={e => { e.target.style.display = 'none' }} />
      </div>
    )
  }
  return (
    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xs font-bold text-white/50 shrink-0">
      {name?.slice(0, 3).toUpperCase()}
    </div>
  )
}

export default function MatchCard({ match, userGuess, allGuesses, profiles, userId, onGuessChange, userScore }) {
  const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED'
  const isFinished = match.status === 'FINISHED'
  const isStarted = isLive || isFinished
  const groupStage = isGroupStage(match.stage)

  const matchTime = new Date(match.utc_date).toLocaleTimeString('he-IL', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jerusalem',
  })

  const stageLabel = STAGE_LABELS[match.stage] || match.stage
  const groupLabel = match.group_name ? ` · ${match.group_name.replace('GROUP_', 'קבוצה ')}` : ''

  const cardBorder = isLive
    ? 'border-red-500/40 shadow-red-500/10'
    : isFinished
      ? 'border-white/8'
      : 'border-white/10 hover:border-white/18'

  return (
    <div className={`glass rounded-2xl border ${cardBorder} shadow-xl transition-all overflow-hidden`}>
      {/* Live stripe */}
      {isLive && <div className="h-0.5 bg-gradient-to-r from-red-500 via-orange-400 to-red-500" />}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <span className="text-xs text-white/35 font-medium">{stageLabel}{groupLabel}</span>
        <div className="flex items-center gap-2">
          {isLive && (
            <div className="flex items-center gap-1.5">
              <span className="live-dot w-2 h-2 bg-red-500 rounded-full inline-block" />
              <span className="text-xs font-bold text-red-400">חי</span>
            </div>
          )}
          {isFinished && <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-lg">הסתיים</span>}
          {!isStarted && <span className="text-xs text-white/50 font-mono">{matchTime}</span>}
        </div>
      </div>

      {/* Match */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-3">
          {/* בית */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <TeamFlag crest={match.home_team_crest} name={match.home_team_name} />
            <span className="font-bold text-white text-sm leading-tight truncate">
              {match.home_team_short || match.home_team_name}
            </span>
          </div>

          {/* תוצאה */}
          <div className="text-center shrink-0">
            {isStarted ? (
              <div className={`text-3xl font-black tracking-tight ${isLive ? 'text-white' : 'text-white/90'}`}>
                {match.home_score_full ?? '?'}<span className="text-white/30 mx-1">:</span>{match.away_score_full ?? '?'}
              </div>
            ) : (
              <div className="text-sm font-bold text-white/20 px-2">VS</div>
            )}
            {isFinished && match.home_score_penalties !== null && (
              <div className="text-xs text-white/30 text-center mt-0.5">
                פנ' {match.home_score_penalties}:{match.away_score_penalties}
              </div>
            )}
          </div>

          {/* אורח */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end">
            <span className="font-bold text-white text-sm leading-tight truncate text-end">
              {match.away_team_short || match.away_team_name}
            </span>
            <TeamFlag crest={match.away_team_crest} name={match.away_team_name} />
          </div>
        </div>

        {/* ניחוש */}
        <div className="mt-4 pt-3 border-t border-white/6">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-white/30 shrink-0 mt-1">הניחוש שלי</span>
            <div className="flex-1">
              <GuessInput match={match} initialGuess={formatGuess(userGuess, groupStage)}
                userId={userId} onGuessChange={onGuessChange} />
            </div>
          </div>

          {/* ניקוד */}
          {isFinished && userScore !== undefined && (
            <div className="flex items-center gap-2 mt-2.5">
              {userScore ? (
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${getResultTypeLabel(userScore.result_type).color}`}>
                  +{userScore.points} נקודות · {getResultTypeLabel(userScore.result_type).text}
                </span>
              ) : (
                <span className="text-xs text-white/20">לא ניחשת</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ניחושי חברים */}
      {isStarted && allGuesses && allGuesses.length > 0 && (
        <div className="px-4 pb-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-xs text-white/30 pt-3 mb-2 font-medium">ניחושי כולם</p>
          <div className="grid grid-cols-2 gap-1.5">
            {allGuesses.map(g => {
              const profile = profiles?.find(p => p.id === g.user_id)
              const name = profile?.display_name || '?'
              const guessText = groupStage
                ? (g.prediction || '—')
                : g.predicted_home_score !== null ? `${g.predicted_home_score}:${g.predicted_away_score}` : '—'
              const isMe = g.user_id === userId
              return (
                <div key={g.id}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-all ${
                    isMe ? 'bg-green-500/15 border border-green-500/25' : 'bg-white/5 border border-white/6'
                  }`}>
                  <span className={`font-medium truncate ${isMe ? 'text-green-400' : 'text-white/60'}`}>
                    {isMe ? `${name} ✓` : name}
                  </span>
                  <span className={`font-black mr-2 shrink-0 ${isMe ? 'text-green-300' : 'text-white/80'}`}>
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

function formatGuess(guess, groupStage) {
  if (!guess) return null
  if (groupStage) return { prediction: guess.prediction }
  return { home: guess.predicted_home_score, away: guess.predicted_away_score,
    predicted_home_score: guess.predicted_home_score, predicted_away_score: guess.predicted_away_score }
}
