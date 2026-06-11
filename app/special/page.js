'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'

const PLAYERS = [
  { name: 'Mbappé',           flag: '🇫🇷', country: 'צרפת' },
  { name: 'Vinicius Jr.',     flag: '🇧🇷', country: 'ברזיל' },
  { name: 'Haaland',          flag: '🇳🇴', country: 'נורווגיה' },
  { name: 'Lamine Yamal',     flag: '🇪🇸', country: 'ספרד' },
  { name: 'Nico Williams',    flag: '🇪🇸', country: 'ספרד' },
  { name: 'Messi',            flag: '🇦🇷', country: 'ארגנטינה' },
  { name: 'Lautaro Martínez', flag: '🇦🇷', country: 'ארגנטינה' },
  { name: 'J. Álvarez',       flag: '🇦🇷', country: 'ארגנטינה' },
  { name: 'Ronaldo',          flag: '🇵🇹', country: 'פורטוגל' },
  { name: 'R. Leão',          flag: '🇵🇹', country: 'פורטוגל' },
  { name: 'João Félix',       flag: '🇵🇹', country: 'פורטוגל' },
  { name: 'Foden',            flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'אנגליה' },
  { name: 'Saka',             flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'אנגליה' },
  { name: 'H. Kane',          flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'אנגליה' },
  { name: 'Rashford',         flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'אנגליה' },
  { name: 'Wirtz',            flag: '🇩🇪', country: 'גרמניה' },
  { name: 'Musiala',          flag: '🇩🇪', country: 'גרמניה' },
  { name: 'Leroy Sané',       flag: '🇩🇪', country: 'גרמניה' },
  { name: 'Pedri',            flag: '🇪🇸', country: 'ספרד' },
  { name: 'Morata',           flag: '🇪🇸', country: 'ספרד' },
  { name: 'Ferran Torres',    flag: '🇪🇸', country: 'ספרד' },
  { name: 'Griezmann',        flag: '🇫🇷', country: 'צרפת' },
  { name: 'Dembélé',          flag: '🇫🇷', country: 'צרפת' },
  { name: 'Olise',            flag: '🇫🇷', country: 'צרפת' },
  { name: 'Rodrygo',          flag: '🇧🇷', country: 'ברזיל' },
  { name: 'Richarlison',      flag: '🇧🇷', country: 'ברזיל' },
  { name: 'G. Jesus',         flag: '🇧🇷', country: 'ברזיל' },
  { name: 'Gakpo',            flag: '🇳🇱', country: 'הולנד' },
  { name: 'Xavi Simons',      flag: '🇳🇱', country: 'הולנד' },
  { name: 'Memphis',          flag: '🇳🇱', country: 'הולנד' },
  { name: 'Son',              flag: '🇰🇷', country: 'קוריאה' },
  { name: 'Darwin Núñez',     flag: '🇺🇾', country: 'אורוגוואי' },
  { name: 'Osimhen',          flag: '🇳🇬', country: 'ניגריה' },
  { name: 'Salah',            flag: '🇪🇬', country: 'מצרים' },
  { name: 'Ziyech',           flag: '🇲🇦', country: 'מרוקו' },
  { name: 'Kvara',            flag: '🇬🇪', country: 'גיאורגיה' },
  { name: 'Lewandowski',      flag: '🇵🇱', country: 'פולין' },
  { name: 'Vlahović',         flag: '🇷🇸', country: 'סרביה' },
  { name: 'Mitrović',         flag: '🇷🇸', country: 'סרביה' },
  { name: 'Pulisic',          flag: '🇺🇸', country: 'ארה״ב' },
  { name: 'Jonathan David',   flag: '🇨🇦', country: 'קנדה' },
  { name: 'Lozano',           flag: '🇲🇽', country: 'מקסיקו' },
  { name: 'Jiménez',          flag: '🇲🇽', country: 'מקסיקו' },
  { name: 'Mané',             flag: '🇸🇳', country: 'סנגל' },
  { name: 'L. Díaz',          flag: '🇨🇴', country: 'קולומביה' },
  { name: 'J. Cuadrado',      flag: '🇨🇴', country: 'קולומביה' },
  { name: 'Arnautović',       flag: '🇦🇹', country: 'אוסטריה' },
  { name: 'Immobile',         flag: '🇮🇹', country: 'איטליה' },
  { name: 'Chiesa',           flag: '🇮🇹', country: 'איטליה' },
  { name: 'Lukaku',           flag: '🇧🇪', country: 'בלגיה' },
]

const BG_FLAGS = [
  { f:'🇧🇷', x:3,  y:9,  s:64, o:0.09, d:4.2 },
  { f:'🇩🇪', x:88, y:5,  s:52, o:0.07, d:5.1 },
  { f:'🇫🇷', x:50, y:2,  s:58, o:0.07, d:3.8 },
  { f:'🇦🇷', x:15, y:26, s:44, o:0.08, d:4.7 },
  { f:'🇪🇸', x:75, y:22, s:60, o:0.07, d:5.5 },
  { f:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', x:92, y:40, s:50, o:0.06, d:4.0 },
  { f:'🇮🇹', x:6,  y:52, s:46, o:0.08, d:6.2 },
  { f:'🇳🇱', x:60, y:57, s:54, o:0.06, d:3.5 },
  { f:'🇵🇹', x:35, y:72, s:48, o:0.07, d:5.8 },
  { f:'🇺🇾', x:85, y:68, s:42, o:0.06, d:4.4 },
  { f:'🇲🇽', x:20, y:83, s:56, o:0.08, d:3.9 },
  { f:'🇺🇸', x:70, y:86, s:50, o:0.06, d:5.3 },
  { f:'🇧🇷', x:45, y:92, s:40, o:0.05, d:4.6 },
  { f:'🇩🇪', x:10, y:66, s:38, o:0.05, d:6.0 },
  { f:'🇫🇷', x:95, y:79, s:44, o:0.05, d:4.1 },
]

function BetsList({ bets, userId, isGreen }) {
  if (!bets.length) return (
    <p className="text-center text-sm font-medium py-2" style={{ color:'rgba(148,163,184,0.35)' }}>
      אף אחד עוד לא בחר
    </p>
  )
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {bets.map((b, i) => {
        const isMe = b.user_id === userId
        return (
          <div key={i} className="flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-all"
            style={isMe
              ? isGreen
                ? { background:'rgba(34,197,94,0.10)', border:'1px solid rgba(34,197,94,0.25)' }
                : { background:'rgba(59,130,246,0.10)', border:'1px solid rgba(59,130,246,0.25)' }
              : { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }
            }>
            <span className={`font-semibold truncate ${
              isMe ? (isGreen ? 'text-green-400' : 'text-blue-400') : 'text-[#94A3B8]/60'
            }`}>
              {b.profiles?.display_name || '?'}{isMe ? ' ✓' : ''}
            </span>
            <span className={`font-black mr-2 shrink-0 ${
              isMe ? (isGreen ? 'text-green-300' : 'text-blue-300') : 'text-white/80'
            }`}>{b.value}</span>
          </div>
        )
      })}
    </div>
  )
}

const searchInputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: '14px',
  padding: '10px 14px',
  fontSize: '13px',
  color: '#F8FAFC',
  outline: 'none',
  marginBottom: '12px',
  transition: 'border-color 160ms ease',
}

export default function SpecialPage() {
  const supabase = createClient()
  const [loading, setLoading]   = useState(true)
  const [profile, setProfile]   = useState(null)
  const [userId, setUserId]     = useState(null)
  const [teams, setTeams]       = useState([])
  const [myBets, setMyBets]     = useState({})
  const [allBets, setAllBets]   = useState([])
  const [saving, setSaving]     = useState({})
  const [teamSearch, setTeamSearch]   = useState('')
  const [playerSearch, setPlayerSearch] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const [profileRes, matchRes, betsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('matches').select('home_team_name, away_team_name').limit(200),
        supabase.from('special_bets').select('*, profiles(display_name)').order('created_at', { ascending: true }),
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

      if (betsRes.data) {
        setAllBets(betsRes.data)
        const mine = {}
        betsRes.data.filter(b => b.user_id === user.id).forEach(b => { mine[b.bet_type] = b.value })
        setMyBets(mine)
      }
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line

  async function saveBet(betType, value) {
    if (!value?.trim()) return
    setSaving(s => ({ ...s, [betType]: true }))
    const { error } = await supabase.from('special_bets').upsert(
      { user_id: userId, bet_type: betType, value: value.trim(), updated_at: new Date().toISOString() },
      { onConflict: 'user_id,bet_type' }
    )
    if (!error) {
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
        <div className="text-5xl" style={{ animation:'float 1s ease-in-out infinite' }}>⭐</div>
      </div>
    )
  }

  const championBets   = allBets.filter(b => b.bet_type === 'champion')
  const scorerBets     = allBets.filter(b => b.bet_type === 'top_scorer')
  const filteredTeams  = teamSearch.trim()
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

      {/* Background flags */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex:0 }}>
        {BG_FLAGS.map((item, i) => (
          <span key={i} style={{
            position: 'absolute',
            left: `${item.x}%`,
            top: `${item.y}%`,
            fontSize: `${item.s}px`,
            opacity: item.o,
            filter: 'blur(2px) saturate(0.5)',
            animation: `float ${item.d}s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`,
            lineHeight: 1,
            userSelect: 'none',
          }}>{item.f}</span>
        ))}
      </div>

      <main className="relative max-w-2xl mx-auto px-3 py-6" style={{ zIndex:1 }}>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[26px] font-black text-white leading-tight">⭐ בחירות מיוחדות</h1>
          <p className="text-sm font-medium mt-0.5" style={{ color:'#94A3B8' }}>
            ניחושים לאורך כל הטורניר
          </p>
        </div>

        {/* ── Champion card ─────────────────────────── */}
        <div className="glass rounded-[20px] border overflow-hidden mb-4"
          style={{ borderColor:'rgba(255,255,255,0.10)' }}>

          {/* Gold top accent */}
          <div className="h-[2px]"
            style={{ background:'linear-gradient(90deg,transparent,rgba(250,204,21,0.6) 30%,rgba(251,191,36,0.4) 70%,transparent)' }} />

          <div className="px-4 py-3.5" style={{ borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(250,204,21,0.03)' }}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-[14px] flex items-center justify-center text-2xl shrink-0"
                style={{ background:'linear-gradient(135deg,rgba(250,204,21,0.22),rgba(245,158,11,0.12))', border:'1px solid rgba(250,204,21,0.22)' }}>
                🏆
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-white text-[15px]">הנבחרת המנצחת</p>
                <p className="text-xs font-medium mt-0.5" style={{ color:'#94A3B8' }}>מי תזכה במונדיאל 2026?</p>
              </div>
              {myBets.champion && (
                <div className="rounded-xl px-3 py-1.5 shrink-0"
                  style={{ background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.30)' }}>
                  <span className="text-green-400 text-sm font-black">{myBets.champion}</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-4">
            <input type="text" placeholder="🔍 חפש נבחרת..." value={teamSearch}
              onChange={e => setTeamSearch(e.target.value)}
              style={searchInputStyle}
              onFocus={e => { e.target.style.borderColor='rgba(255,255,255,0.22)' }}
              onBlur={e  => { e.target.style.borderColor='rgba(255,255,255,0.10)' }}
            />
            {filteredTeams.length === 0 ? (
              <p className="text-center text-sm py-4" style={{ color:'rgba(148,163,184,0.40)' }}>
                {teams.length === 0 ? 'יש לסנכרן משחקים קודם' : 'לא נמצאה נבחרת'}
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-1.5 max-h-52 overflow-y-auto">
                {filteredTeams.map(team => {
                  const active = myBets.champion === team
                  return (
                    <button key={team} onClick={() => saveBet('champion', team)}
                      disabled={saving.champion}
                      className="py-2 px-1.5 rounded-[12px] text-xs font-bold text-center transition-all active:scale-95 truncate"
                      style={active ? {
                        background: 'var(--green)',
                        color: '#fff',
                        boxShadow: '0 0 14px var(--green-glow)',
                      } : {
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.09)',
                        color: 'rgba(148,163,184,0.80)',
                      }}>
                      {team}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {championBets.length > 0 && (
            <div className="px-4 pb-4" style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-[11px] font-semibold pt-3 mb-2.5" style={{ color:'rgba(148,163,184,0.45)' }}>
                הבחירות של כולם
              </p>
              <BetsList bets={championBets} userId={userId} isGreen />
            </div>
          )}
        </div>

        {/* ── Top Scorer card ───────────────────────── */}
        <div className="glass rounded-[20px] border overflow-hidden"
          style={{ borderColor:'rgba(255,255,255,0.10)' }}>

          {/* Blue top accent */}
          <div className="h-[2px]"
            style={{ background:'linear-gradient(90deg,transparent,rgba(99,102,241,0.7) 30%,rgba(139,92,246,0.5) 70%,transparent)' }} />

          <div className="px-4 py-3.5" style={{ borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(99,102,241,0.025)' }}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-[14px] flex items-center justify-center text-2xl shrink-0"
                style={{ background:'linear-gradient(135deg,rgba(99,102,241,0.22),rgba(139,92,246,0.12))', border:'1px solid rgba(99,102,241,0.25)' }}>
                👟
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-white text-[15px]">מלך השערים</p>
                <p className="text-xs font-medium mt-0.5" style={{ color:'#94A3B8' }}>מי יהיה מלך השערים של המונדיאל?</p>
              </div>
              {myBets.top_scorer && (
                <div className="rounded-xl px-3 py-1.5 shrink-0"
                  style={{ background:'rgba(99,102,241,0.14)', border:'1px solid rgba(99,102,241,0.28)' }}>
                  <span className="text-indigo-300 text-xs font-black">{myBets.top_scorer}</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-4">
            <input type="text" placeholder="🔍 חפש שחקן או נבחרת..." value={playerSearch}
              onChange={e => setPlayerSearch(e.target.value)}
              style={searchInputStyle}
              onFocus={e => { e.target.style.borderColor='rgba(255,255,255,0.22)' }}
              onBlur={e  => { e.target.style.borderColor='rgba(255,255,255,0.10)' }}
            />
            <div className="grid grid-cols-3 gap-1.5 max-h-56 overflow-y-auto">
              {filteredPlayers.map(p => {
                const active = myBets.top_scorer === p.name
                return (
                  <button key={p.name} onClick={() => saveBet('top_scorer', p.name)}
                    disabled={saving.top_scorer}
                    className="py-2.5 px-1.5 rounded-[12px] text-center transition-all active:scale-95"
                    style={active ? {
                      background: 'rgba(99,102,241,0.85)',
                      color: '#fff',
                      boxShadow: '0 0 14px rgba(99,102,241,0.40)',
                    } : {
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.09)',
                    }}>
                    <div className="text-base leading-none">{p.flag}</div>
                    <div className="text-[11px] font-bold leading-tight mt-1 text-white/90 truncate">{p.name}</div>
                    <div className="text-[9px] font-medium mt-0.5" style={{ color:'rgba(148,163,184,0.50)' }}>{p.country}</div>
                  </button>
                )
              })}
            </div>
          </div>

          {scorerBets.length > 0 && (
            <div className="px-4 pb-4" style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-[11px] font-semibold pt-3 mb-2.5" style={{ color:'rgba(148,163,184,0.45)' }}>
                הבחירות של כולם
              </p>
              <BetsList bets={scorerBets} userId={userId} isGreen={false} />
            </div>
          )}
        </div>

      </main>
    </>
  )
}
