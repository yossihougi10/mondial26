'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'

const PLAYERS = [
  { name: 'Mbappé', flag: '🇫🇷', country: 'צרפת' },
  { name: 'Vinicius Jr.', flag: '🇧🇷', country: 'ברזיל' },
  { name: 'Haaland', flag: '🇳🇴', country: 'נורווגיה' },
  { name: 'Lamine Yamal', flag: '🇪🇸', country: 'ספרד' },
  { name: 'Nico Williams', flag: '🇪🇸', country: 'ספרד' },
  { name: 'Messi', flag: '🇦🇷', country: 'ארגנטינה' },
  { name: 'Lautaro Martínez', flag: '🇦🇷', country: 'ארגנטינה' },
  { name: 'J. Álvarez', flag: '🇦🇷', country: 'ארגנטינה' },
  { name: 'Ronaldo', flag: '🇵🇹', country: 'פורטוגל' },
  { name: 'R. Leão', flag: '🇵🇹', country: 'פורטוגל' },
  { name: 'João Félix', flag: '🇵🇹', country: 'פורטוגל' },
  { name: 'Foden', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'אנגליה' },
  { name: 'Saka', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'אנגליה' },
  { name: 'H. Kane', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'אנגליה' },
  { name: 'Rashford', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'אנגליה' },
  { name: 'Wirtz', flag: '🇩🇪', country: 'גרמניה' },
  { name: 'Musiala', flag: '🇩🇪', country: 'גרמניה' },
  { name: 'Leroy Sané', flag: '🇩🇪', country: 'גרמניה' },
  { name: 'Pedri', flag: '🇪🇸', country: 'ספרד' },
  { name: 'Morata', flag: '🇪🇸', country: 'ספרד' },
  { name: 'Ferran Torres', flag: '🇪🇸', country: 'ספרד' },
  { name: 'Griezmann', flag: '🇫🇷', country: 'צרפת' },
  { name: 'Dembélé', flag: '🇫🇷', country: 'צרפת' },
  { name: 'Olise', flag: '🇫🇷', country: 'צרפת' },
  { name: 'Rodrygo', flag: '🇧🇷', country: 'ברזיל' },
  { name: 'Richarlison', flag: '🇧🇷', country: 'ברזיל' },
  { name: 'G. Jesus', flag: '🇧🇷', country: 'ברזיל' },
  { name: 'Gakpo', flag: '🇳🇱', country: 'הולנד' },
  { name: 'Xavi Simons', flag: '🇳🇱', country: 'הולנד' },
  { name: 'Memphis', flag: '🇳🇱', country: 'הולנד' },
  { name: 'Son', flag: '🇰🇷', country: 'קוריאה' },
  { name: 'Darwin Núñez', flag: '🇺🇾', country: 'אורוגוואי' },
  { name: 'Osimhen', flag: '🇳🇬', country: 'ניגריה' },
  { name: 'Salah', flag: '🇪🇬', country: 'מצרים' },
  { name: 'Ziyech', flag: '🇲🇦', country: 'מרוקו' },
  { name: 'Kvara', flag: '🇬🇪', country: 'גיאורגיה' },
  { name: 'Lewandowski', flag: '🇵🇱', country: 'פולין' },
  { name: 'Vlahović', flag: '🇷🇸', country: 'סרביה' },
  { name: 'Mitrović', flag: '🇷🇸', country: 'סרביה' },
  { name: 'Pulisic', flag: '🇺🇸', country: 'ארה״ב' },
  { name: 'Jonathan David', flag: '🇨🇦', country: 'קנדה' },
  { name: 'Lozano', flag: '🇲🇽', country: 'מקסיקו' },
  { name: 'Jiménez', flag: '🇲🇽', country: 'מקסיקו' },
  { name: 'Mané', flag: '🇸🇳', country: 'סנגל' },
  { name: 'L. Díaz', flag: '🇨🇴', country: 'קולומביה' },
  { name: 'J. Cuadrado', flag: '🇨🇴', country: 'קולומביה' },
  { name: 'Arnautović', flag: '🇦🇹', country: 'אוסטריה' },
  { name: 'Immobile', flag: '🇮🇹', country: 'איטליה' },
  { name: 'Chiesa', flag: '🇮🇹', country: 'איטליה' },
  { name: 'Lukaku', flag: '🇧🇪', country: 'בלגיה' },
]

// דגלים לרקע — מיקומים קבועים
const BG_FLAGS = [
  { f: '🇧🇷', x: 3, y: 8, s: 64, o: 0.10, d: 4.2 },
  { f: '🇩🇪', x: 88, y: 5, s: 52, o: 0.08, d: 5.1 },
  { f: '🇫🇷', x: 50, y: 2, s: 58, o: 0.07, d: 3.8 },
  { f: '🇦🇷', x: 15, y: 25, s: 44, o: 0.09, d: 4.7 },
  { f: '🇪🇸', x: 75, y: 22, s: 60, o: 0.08, d: 5.5 },
  { f: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', x: 92, y: 40, s: 50, o: 0.07, d: 4.0 },
  { f: '🇮🇹', x: 6, y: 50, s: 46, o: 0.09, d: 6.2 },
  { f: '🇳🇱', x: 60, y: 55, s: 54, o: 0.06, d: 3.5 },
  { f: '🇵🇹', x: 35, y: 70, s: 48, o: 0.08, d: 5.8 },
  { f: '🇺🇾', x: 85, y: 68, s: 42, o: 0.07, d: 4.4 },
  { f: '🇲🇽', x: 20, y: 82, s: 56, o: 0.09, d: 3.9 },
  { f: '🇺🇸', x: 70, y: 85, s: 50, o: 0.07, d: 5.3 },
  { f: '🇧🇷', x: 45, y: 90, s: 40, o: 0.06, d: 4.6 },
  { f: '🇩🇪', x: 10, y: 65, s: 38, o: 0.05, d: 6.0 },
  { f: '🇫🇷', x: 95, y: 78, s: 44, o: 0.06, d: 4.1 },
]

function BetsList({ bets, userId, isGreen }) {
  if (!bets.length) return (
    <p className="text-center text-white/25 text-sm py-2">אף אחד עוד לא בחר</p>
  )
  const accent = isGreen
    ? 'bg-green-500/15 border-green-500/25 text-green-400'
    : 'bg-blue-500/15 border-blue-500/25 text-blue-400'
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {bets.map((b, i) => {
        const isMe = b.user_id === userId
        return (
          <div key={i} className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs border transition-all ${
            isMe ? accent : 'bg-white/5 border-white/6'
          }`}>
            <span className={`font-medium truncate ${isMe ? '' : 'text-white/50'}`}>
              {b.profiles?.display_name || '?'}{isMe ? ' ✓' : ''}
            </span>
            <span className={`font-black mr-2 shrink-0 ${isMe ? '' : 'text-white/80'}`}>{b.value}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function SpecialPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [userId, setUserId] = useState(null)
  const [teams, setTeams] = useState([])
  const [myBets, setMyBets] = useState({})
  const [allBets, setAllBets] = useState([])
  const [saving, setSaving] = useState({})
  const [teamSearch, setTeamSearch] = useState('')
  const [playerSearch, setPlayerSearch] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const [profileRes, matchRes, betsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('matches').select('home_team_name, away_team_name').limit(200),
        fetch('/api/special-bets').then(r => r.json()),
      ])

      setProfile(profileRes.data)

      if (matchRes.data?.length) {
        const teamSet = new Set()
        matchRes.data.forEach(m => {
          if (m.home_team_name) teamSet.add(m.home_team_name)
          if (m.away_team_name) teamSet.add(m.away_team_name)
        })
        setTeams([...teamSet].sort((a, b) => a.localeCompare(b, 'he')))
      }

      if (betsRes.bets) {
        setAllBets(betsRes.bets)
        const mine = {}
        betsRes.bets.filter(b => b.user_id === user.id).forEach(b => { mine[b.bet_type] = b.value })
        setMyBets(mine)
      }
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line

  async function saveBet(betType, value) {
    if (!value?.trim()) return
    setSaving(s => ({ ...s, [betType]: true }))
    const res = await fetch('/api/special-bets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bet_type: betType, value: value.trim() }),
    })
    const data = await res.json()
    if (data.success) {
      setMyBets(b => ({ ...b, [betType]: value.trim() }))
      setAllBets(prev => {
        const without = prev.filter(b => !(b.user_id === userId && b.bet_type === betType))
        return [...without, {
          user_id: userId, bet_type: betType, value: value.trim(),
          profiles: { display_name: profile?.display_name },
        }]
      })
    }
    setSaving(s => ({ ...s, [betType]: false }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-5xl" style={{ animation: 'float 1s ease-in-out infinite' }}>⭐</div>
      </div>
    )
  }

  const championBets = allBets.filter(b => b.bet_type === 'champion')
  const scorerBets = allBets.filter(b => b.bet_type === 'top_scorer')
  const filteredTeams = teamSearch.trim()
    ? teams.filter(t => t.toLowerCase().includes(teamSearch.toLowerCase()))
    : teams
  const filteredPlayers = playerSearch.trim()
    ? PLAYERS.filter(p =>
        p.name.toLowerCase().includes(playerSearch.toLowerCase()) ||
        p.country.includes(playerSearch)
      )
    : PLAYERS

  return (
    <>
      <Navbar profile={profile} />

      {/* רקע דגלים */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {BG_FLAGS.map((item, i) => (
          <span key={i} style={{
            position: 'absolute',
            left: `${item.x}%`,
            top: `${item.y}%`,
            fontSize: `${item.s}px`,
            opacity: item.o,
            filter: 'blur(2px) saturate(0.6)',
            animation: `float ${item.d}s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`,
            lineHeight: 1,
            userSelect: 'none',
          }}>
            {item.f}
          </span>
        ))}
      </div>

      <main className="relative max-w-2xl mx-auto px-3 py-5" style={{ zIndex: 1 }}>

        <div className="mb-6">
          <h1 className="text-2xl font-black text-white">⭐ בחירות מיוחדות</h1>
          <p className="text-white/40 text-sm mt-1">ניחושים לאורך כל הטורניר</p>
        </div>

        {/* הנבחרת המנצחת */}
        <div className="glass rounded-2xl border border-white/10 overflow-hidden mb-4">
          <div className="px-4 py-3.5 border-b border-white/6" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-yellow-500/30 to-orange-500/20 flex items-center justify-center text-2xl shrink-0">🏆</div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-black">הנבחרת המנצחת</p>
                <p className="text-white/35 text-xs">מי תזכה במונדיאל 2026?</p>
              </div>
              {myBets.champion && (
                <div className="bg-green-500/15 border border-green-500/25 rounded-xl px-3 py-1.5 shrink-0">
                  <span className="text-green-400 text-sm font-black">{myBets.champion}</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-4">
            <input type="text" placeholder="🔍 חפש נבחרת..." value={teamSearch}
              onChange={e => setTeamSearch(e.target.value)}
              className="w-full bg-white/8 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/25 mb-3 transition-all"
            />
            {filteredTeams.length === 0 ? (
              <p className="text-center text-white/30 text-sm py-4">
                {teams.length === 0 ? 'יש לסנכרן משחקים קודם' : 'לא נמצאה נבחרת'}
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-1.5 max-h-52 overflow-y-auto">
                {filteredTeams.map(team => (
                  <button key={team} onClick={() => saveBet('champion', team)} disabled={saving.champion}
                    className={`py-2 px-1.5 rounded-xl text-xs font-bold text-center transition-all active:scale-95 truncate ${
                      myBets.champion === team
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                        : 'bg-white/6 text-white/60 border border-white/8 hover:bg-white/12 hover:text-white hover:border-white/15'
                    }`}>
                    {team}
                  </button>
                ))}
              </div>
            )}
          </div>

          {championBets.length > 0 && (
            <div className="px-4 pb-4 border-t border-white/6 pt-3">
              <p className="text-xs text-white/30 mb-2 font-medium">הבחירות של כולם</p>
              <BetsList bets={championBets} userId={userId} isGreen />
            </div>
          )}
        </div>

        {/* מלך השערים */}
        <div className="glass rounded-2xl border border-white/10 overflow-hidden">
          <div className="px-4 py-3.5 border-b border-white/6" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/30 to-purple-500/20 flex items-center justify-center text-2xl shrink-0">👟</div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-black">מלך השערים</p>
                <p className="text-white/35 text-xs">מי יהיה מלך השערים של המונדיאל?</p>
              </div>
              {myBets.top_scorer && (
                <div className="bg-blue-500/15 border border-blue-500/25 rounded-xl px-3 py-1.5 shrink-0">
                  <span className="text-blue-300 text-xs font-black">{myBets.top_scorer}</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-4">
            <input type="text" placeholder="🔍 חפש שחקן..." value={playerSearch}
              onChange={e => setPlayerSearch(e.target.value)}
              className="w-full bg-white/8 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/25 mb-3 transition-all"
            />
            <div className="grid grid-cols-3 gap-1.5 max-h-56 overflow-y-auto">
              {filteredPlayers.map(p => (
                <button key={p.name} onClick={() => saveBet('top_scorer', p.name)}
                  disabled={saving.top_scorer}
                  className={`py-2 px-1.5 rounded-xl text-center transition-all active:scale-95 ${
                    myBets.top_scorer === p.name
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-white/6 text-white/60 border border-white/8 hover:bg-white/12 hover:text-white hover:border-white/15'
                  }`}>
                  <div className="text-base leading-tight">{p.flag}</div>
                  <div className="text-xs font-bold leading-tight mt-0.5 truncate">{p.name}</div>
                  <div className="text-white/35 leading-none" style={{ fontSize: '10px' }}>{p.country}</div>
                </button>
              ))}
            </div>
          </div>

          {scorerBets.length > 0 && (
            <div className="px-4 pb-4 border-t border-white/6 pt-3">
              <p className="text-xs text-white/30 mb-2 font-medium">הבחירות של כולם</p>
              <BetsList bets={scorerBets} userId={userId} isGreen={false} />
            </div>
          )}
        </div>

      </main>
    </>
  )
}
