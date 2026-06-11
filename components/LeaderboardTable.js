export default function LeaderboardTable({ rows, currentUserId }) {
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
