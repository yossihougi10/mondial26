const API_BASE = 'https://api.football-data.org/v4'

async function apiFetch(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY },
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error(`football-data.org error: ${res.status} ${path}`)
  return res.json()
}

export async function fetchAllMatches() {
  const data = await apiFetch('/competitions/WC/matches?season=2026')
  return data.matches || []
}

export async function fetchLiveMatches() {
  const data = await apiFetch('/competitions/WC/matches?season=2026&status=LIVE')
  return data.matches || []
}

export async function fetchMatch(id) {
  const data = await apiFetch(`/matches/${id}`)
  return data
}

// ממיר שדה מה-API לפורמט הטבלה שלנו
export function transformMatch(m) {
  return {
    id: m.id,
    utc_date: m.utcDate,
    status: m.status,
    matchday: m.matchday,
    stage: m.stage,
    group_name: m.group || null,
    home_team_id: m.homeTeam?.id || null,
    home_team_name: m.homeTeam?.name || 'TBD',
    home_team_short: m.homeTeam?.shortName || m.homeTeam?.tla || null,
    home_team_crest: m.homeTeam?.crest || null,
    away_team_id: m.awayTeam?.id || null,
    away_team_name: m.awayTeam?.name || 'TBD',
    away_team_short: m.awayTeam?.shortName || m.awayTeam?.tla || null,
    away_team_crest: m.awayTeam?.crest || null,
    home_score_full: m.score?.fullTime?.home ?? null,
    away_score_full: m.score?.fullTime?.away ?? null,
    home_score_et: m.score?.extraTime?.home ?? null,
    away_score_et: m.score?.extraTime?.away ?? null,
    home_score_penalties: m.score?.penalties?.home ?? null,
    away_score_penalties: m.score?.penalties?.away ?? null,
    winner: m.score?.winner || null,
    last_updated: m.lastUpdated || new Date().toISOString(),
  }
}
