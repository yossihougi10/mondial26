const GROUP_STAGE = 'GROUP_STAGE'

export function isGroupStage(stage) {
  return stage === GROUP_STAGE
}

// מחשב נקודות לניחוש אחד
export function calculatePoints(guess, match) {
  if (match.home_score_full === null || match.away_score_full === null) return 0

  if (isGroupStage(match.stage)) {
    const actualResult =
      match.home_score_full > match.away_score_full ? '1' :
      match.home_score_full < match.away_score_full ? '2' : 'X'

    if (guess.prediction === actualResult) return 1
    return 0
  }

  // שלב נוקאאוט - ניחוש תוצאה מדויקת
  const ph = guess.predicted_home_score
  const pa = guess.predicted_away_score

  if (ph === null || pa === null) return 0

  // תוצאה מדויקת = 3 נקודות
  if (ph === match.home_score_full && pa === match.away_score_full) {
    return 3
  }

  // כיוון נכון = 1 נקודה (מי עבר הלאה לפי winner)
  const predictedWinner =
    ph > pa ? 'HOME_TEAM' :
    ph < pa ? 'AWAY_TEAM' : 'DRAW'

  if (predictedWinner === match.winner) return 1

  return 0
}

export function getResultType(guess, match) {
  const points = calculatePoints(guess, match)
  if (points === 3) return 'exact'
  if (points === 1) return 'direction'
  return 'wrong'
}

export function getResultTypeLabel(resultType) {
  if (resultType === 'exact') return { text: 'מדויק', color: 'text-green-600 bg-green-100' }
  if (resultType === 'direction') return { text: 'כיוון', color: 'text-blue-600 bg-blue-100' }
  return { text: 'פספוס', color: 'text-red-600 bg-red-100' }
}
