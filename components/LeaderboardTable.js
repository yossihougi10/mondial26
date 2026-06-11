export default function LeaderboardTable({ rows, currentUserId, specialBets = [] }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="text-center py-20 text-[#94A3B8]/40">
        <div className="text-5xl mb-4" style={{ filter:'grayscale(0.4)' }}>🏆</div>
        <p className="text-sm font-medium">הדירוג יתעדכן לאחר המשחקים הראשונים</p>
      </div>
    )
  }

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="space-y-2">
      {rows.map((row, i) => {
        const isMe  = row.id === currentUserId
        const isTop = i < 3
        const champion  = specialBets.find(b => b.user_id === row.id && b.bet_type === 'champion')?.value
        const topScorer = specialBets.find(b => b.user_id === row.id && b.bet_type === 'top_scorer')?.value

        return (
          <div key={row.id}
            className="flex items-center gap-4 rounded-[18px] px-4 py-3.5 transition-all duration-200"
            style={isMe ? {
              background: 'rgba(34,197,94,0.09)',
              border: '1px solid rgba(34,197,94,0.28)',
              boxShadow: '0 0 20px rgba(34,197,94,0.07)',
            } : isTop ? {
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.10)',
            } : {
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}>

            {/* Rank */}
            <div className="w-8 text-center shrink-0">
              {i < 3 ? (
                <span className="text-xl">{medals[i]}</span>
              ) : (
                <span className="text-sm font-black text-[#94A3B8]/40">#{i + 1}</span>
              )}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <p className={`font-black truncate text-sm ${isMe ? 'text-green-400' : 'text-[#F8FAFC]'}`}>
                {row.display_name}
                {isMe && <span className="text-green-500/60 text-xs font-normal mr-1.5">(אני)</span>}
              </p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-[11px] font-medium" style={{ color:'rgba(148,163,184,0.45)' }}>
                  ✓✓ {row.exact_count} מדויק
                </span>
                <span className="text-[11px] font-medium" style={{ color:'rgba(148,163,184,0.30)' }}>
                  ✓ {row.direction_count} כיוון
                </span>
              </div>
              {(champion || topScorer) && (
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  {champion && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg truncate max-w-[110px]"
                      style={{ background:'rgba(250,204,21,0.10)', color:'rgba(250,204,21,0.70)', border:'1px solid rgba(250,204,21,0.18)' }}>
                      🏆 {champion}
                    </span>
                  )}
                  {topScorer && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg truncate max-w-[110px]"
                      style={{ background:'rgba(99,102,241,0.10)', color:'rgba(139,92,246,0.80)', border:'1px solid rgba(99,102,241,0.20)' }}>
                      👟 {topScorer}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Points */}
            <div className="text-end shrink-0">
              <p className={`text-2xl font-black leading-none ${
                i === 0 ? 'gold-text' : isMe ? 'gradient-text' : 'text-[#F8FAFC]'
              }`}>
                {row.total_points}
              </p>
              <p className="text-[10px] font-medium mt-0.5" style={{ color:'rgba(148,163,184,0.40)' }}>
                נקודות
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
