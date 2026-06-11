'use client'

import Image from 'next/image'
import GuessInput from './GuessInput'
import { isGroupStage, getResultTypeLabel } from '@/lib/scoring'

const STATUS_MAP = {
  FINISHED: { label: 'הסתיים', color: 'bg-slate-100 text-slate-600' },
  IN_PLAY: { label: 'חי! 🔴', color: 'bg-red-100 text-red-700 animate-pulse' },
  PAUSED: { label: 'הפסקה', color: 'bg-orange-100 text-orange-700' },
  SCHEDULED: { label: null, color: '' },
  TIMED: { label: null, color: '' },
}

const STAGE_LABELS = {
  GROUP_STAGE: 'שלב הבתים',
  ROUND_OF_32: 'שמינית גמר',
  ROUND_OF_16: 'שמינית גמר',
  QUARTER_FINALS: 'רבע גמר',
  SEMI_FINALS: 'חצי גמר',
  THIRD_PLACE: 'משחק גמר 3/4',
  FINAL: 'גמר',
}

function TeamCrest({ crest, name }) {
  if (crest) {
    return (
      <Image
        src={crest}
        alt={name}
        width={36}
        height={36}
        className="rounded-full object-contain"
        onError={e => { e.target.style.display = 'none' }}
      />
    )
  }
  return (
    <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
      {name.slice(0, 3).toUpperCase()}
    </div>
  )
}

export default function MatchCard({ match, userGuess, allGuesses, profiles, userId, onGuessChange, userScore }) {
  const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED'
  const isFinished = match.status === 'FINISHED'
  const isStarted = isLive || isFinished
  const groupStage = isGroupStage(match.stage)

  const matchTime = new Date(match.utc_date).toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jerusalem',
  })

  const statusInfo = STATUS_MAP[match.status] || { label: match.status, color: 'bg-slate-100 text-slate-600' }
  const stageLabel = STAGE_LABELS[match.stage] || match.stage
  const groupLabel = match.group_name ? ` - ${match.group_name.replace('GROUP_', 'קבוצה ')}` : ''

  return (
    <div className={`bg-white rounded-xl shadow-sm border ${isLive ? 'border-red-300 shadow-red-100' : 'border-slate-100'} overflow-hidden`}>
      {/* כותרת קלה */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100">
        <span className="text-xs text-slate-500">{stageLabel}{groupLabel}</span>
        <div className="flex items-center gap-2">
          {statusInfo.label && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          )}
          {!isStarted && (
            <span className="text-xs text-slate-500">{matchTime}</span>
          )}
        </div>
      </div>

      {/* משחק */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          {/* קבוצה ביתית */}
          <div className="flex items-center gap-2 flex-1">
            <TeamCrest crest={match.home_team_crest} name={match.home_team_name} />
            <span className="font-semibold text-slate-800 text-sm leading-tight">
              {match.home_team_short || match.home_team_name}
            </span>
          </div>

          {/* תוצאה / שעה */}
          <div className="text-center min-w-[70px]">
            {isStarted ? (
              <div className="text-2xl font-bold text-slate-800 leading-none">
                {match.home_score_full ?? '?'} - {match.away_score_full ?? '?'}
              </div>
            ) : (
              <div className="text-lg font-medium text-slate-400">VS</div>
            )}
            {isFinished && match.home_score_penalties !== null && (
              <div className="text-xs text-slate-400 mt-0.5">
                ({match.home_score_penalties}-{match.away_score_penalties} פנ')
              </div>
            )}
          </div>

          {/* קבוצת אורחים */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            <span className="font-semibold text-slate-800 text-sm leading-tight text-end">
              {match.away_team_short || match.away_team_name}
            </span>
            <TeamCrest crest={match.away_team_crest} name={match.away_team_name} />
          </div>
        </div>

        {/* הניחוש שלי */}
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-medium text-slate-500 mt-2">הניחוש שלי:</span>
            <div className="flex-1">
              <GuessInput
                match={match}
                initialGuess={formatGuessForInput(userGuess, groupStage)}
                userId={userId}
                onGuessChange={onGuessChange}
              />
            </div>
          </div>

          {/* ניקוד */}
          {isFinished && userScore !== undefined && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-slate-500">ניקוד:</span>
              {userScore ? (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getResultTypeLabel(userScore.result_type).color}`}>
                  +{userScore.points} {getResultTypeLabel(userScore.result_type).text}
                </span>
              ) : (
                <span className="text-xs text-slate-400">—</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ניחושי כל החברים - רק לאחר נעילה */}
      {isStarted && allGuesses && allGuesses.length > 0 && (
        <div className="border-t border-slate-100 px-4 py-3">
          <p className="text-xs font-medium text-slate-500 mb-2">ניחושי החברים:</p>
          <div className="grid grid-cols-2 gap-1.5">
            {allGuesses.map(g => {
              const profile = profiles?.find(p => p.id === g.user_id)
              const name = profile?.display_name || 'משתמש'
              const guessText = groupStage
                ? g.prediction || '—'
                : g.predicted_home_score !== null
                  ? `${g.predicted_home_score}-${g.predicted_away_score}`
                  : '—'
              const isMe = g.user_id === userId
              return (
                <div
                  key={g.id}
                  className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs ${
                    isMe ? 'bg-green-50 border border-green-200' : 'bg-slate-50'
                  }`}
                >
                  <span className={`font-medium truncate ${isMe ? 'text-green-700' : 'text-slate-700'}`}>
                    {isMe ? `${name} (אני)` : name}
                  </span>
                  <span className={`font-bold mr-2 shrink-0 ${isMe ? 'text-green-600' : 'text-slate-600'}`}>
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

function formatGuessForInput(guess, groupStage) {
  if (!guess) return null
  if (groupStage) return { prediction: guess.prediction }
  return {
    home: guess.predicted_home_score,
    away: guess.predicted_away_score,
    predicted_home_score: guess.predicted_home_score,
    predicted_away_score: guess.predicted_away_score,
  }
}
