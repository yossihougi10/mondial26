export default function LeaderboardTable({ rows, currentUserId }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <div className="text-4xl mb-3">🏆</div>
        <p>הדירוג יתעדכן לאחר המשחקים הראשונים</p>
      </div>
    )
  }

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="overflow-x-auto rounded-xl shadow-sm border border-slate-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-800 text-white">
            <th className="px-4 py-3 text-right font-semibold">#</th>
            <th className="px-4 py-3 text-right font-semibold">שחקן</th>
            <th className="px-4 py-3 text-center font-semibold">נקודות</th>
            <th className="px-4 py-3 text-center font-semibold hidden sm:table-cell">מדויק</th>
            <th className="px-4 py-3 text-center font-semibold hidden sm:table-cell">כיוון</th>
            <th className="px-4 py-3 text-center font-semibold hidden sm:table-cell">משחקים</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const isMe = row.id === currentUserId
            return (
              <tr
                key={row.id}
                className={`border-t border-slate-100 ${
                  isMe ? 'bg-green-50' : i % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                }`}
              >
                <td className="px-4 py-3 text-right">
                  <span className="font-semibold text-slate-600">
                    {medals[i] || `${i + 1}.`}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`font-semibold ${isMe ? 'text-green-700' : 'text-slate-800'}`}>
                    {row.display_name}
                    {isMe && <span className="text-xs text-green-600 mr-1">(אני)</span>}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xl font-bold ${
                    i === 0 ? 'text-yellow-500' : 'text-slate-800'
                  }`}>
                    {row.total_points}
                  </span>
                </td>
                <td className="px-4 py-3 text-center hidden sm:table-cell">
                  <span className="bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full text-xs">
                    {row.exact_count} ✓✓
                  </span>
                </td>
                <td className="px-4 py-3 text-center hidden sm:table-cell">
                  <span className="bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full text-xs">
                    {row.direction_count} ✓
                  </span>
                </td>
                <td className="px-4 py-3 text-center hidden sm:table-cell text-slate-500">
                  {row.games_scored}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
