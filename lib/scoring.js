export function isGroupStage(stage) {
  return stage === 'GROUP_STAGE'
}

// מחשב נקודות לניחוש — עובד לשני המצבים (כיוון / מדויק) בכל שלב
export function calculatePoints(guess, match) {
  if (match.home_score_full === null || match.away_score_full === null) return 0

  const hasExact =
    guess.predicted_home_score !== null && guess.predicted_home_score !== undefined

  if (hasExact) {
    const ph = guess.predicted_home_score
    const pa = guess.predicted_away_score
    if (pa === null || pa === undefined) return 0

    if (ph === match.home_score_full && pa === match.away_score_full) return 3

    // כיוון נכון = 1 נקודה
    const predictedWinner = ph > pa ? 'HOME_TEAM' : ph < pa ? 'AWAY_TEAM' : 'DRAW'
    const actualWinner =
      match.winner ||
      (match.home_score_full > match.away_score_full ? 'HOME_TEAM' :
       match.home_score_full < match.away_score_full ? 'AWAY_TEAM' : 'DRAW')
    return predictedWinner === actualWinner ? 1 : 0
  }

  if (guess.prediction) {
    const actualResult =
      match.home_score_full > match.away_score_full ? '1' :
      match.home_score_full < match.away_score_full ? '2' : 'X'
    return guess.prediction === actualResult ? 1 : 0
  }

  return 0
}

export function getResultType(guess, match) {
  const points = calculatePoints(guess, match)
  if (points === 3) return 'exact'
  if (points === 1) return 'direction'
  return 'wrong'
}

export function getResultTypeLabel(resultType) {
  if (resultType === 'exact') return { text: 'מדויק ✓✓', color: 'bg-green-500/20 text-green-400' }
  if (resultType === 'direction') return { text: 'כיוון ✓', color: 'bg-blue-500/20 text-blue-400' }
  return { text: 'פספוס', color: 'bg-white/8 text-white/30' }
}
