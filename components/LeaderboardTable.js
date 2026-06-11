export default function LeaderboardTable({ rows, currentUserId }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="text-center py-16 text-white/30">
        <div className="text-5xl mb-4">🏆</div>
        <p>הדירוג יתעדכן לאחר המשחקים הראשונים</p>
      </div>
    )
  }

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="space-y-2">
      {rows.map((row, i) => {
        const isMe = row.id === currentUserId
        const isTop3 = i < 3
        return (
          <div key={row.id}
            className={`flex items-center gap-4 rounded-2xl px-4 py-3.5 border transition-all ${
              isMe
                ? 'bg-green-500/12 border-green-500/30 shadow-green-500/10 shadow-lg'
                : isTop3
                  ? 'bg-white/6 border-white/12'
                  : 'bg-white/4 border-white/7 hover:bg-white/6'
            }`}>
            {/* מיקום */}
            <div className="w-8 text-center shrink-0">
              {i < 3
                ? <span className="text-xl">{medals[i]}</span>
                : <span className="text-white/30 font-bold text-sm">{i + 1}</span>
              }
            </div>

            {/* שם */}
            <div className="flex-1 min-w-0">
              <p className={`font-bold truncate ${isMe ? 'text-green-300' : 'text-white'}`}>
                {row.display_name}
                {isMe && <span className="text-green-500/70 text-xs font-normal mr-1">(אני)</span>}
              </p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-xs text-white/35">✓✓ {row.exact_count} מדויק</span>
                <span className="text-xs text-white/25">✓ {row.direction_count} כיוון</span>
              </div>
            </div>

            {/* נקודות */}
            <div className="text-end shrink-0">
              <p className={`text-2xl font-black ${
                i === 0 ? 'gold-text' : isMe ? 'gradient-text' : 'text-white'
              }`}>
                {row.total_points}
              </p>
              <p className="text-xs text-white/30">נקודות</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
