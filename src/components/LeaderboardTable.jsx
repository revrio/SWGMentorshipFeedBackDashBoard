import { Medal } from "lucide-react";
import { formatPercent, formatRating, formatScore } from "../lib/scoringUtils";

function rankTone(rank) {
  if (rank === 1) return "bg-amber-100 text-amber-800";
  if (rank === 2) return "bg-slate-200 text-slate-700";
  if (rank === 3) return "bg-orange-100 text-orange-800";
  return "bg-sky-50 text-swg-blue";
}

export default function LeaderboardTable({ rows }) {
  if (!rows.length) {
    return (
      <div className="rounded-md border border-dashed border-swg-line bg-white p-8 text-center text-sm text-slate-600">
        No leaderboard snapshot is available for this view yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-swg-line bg-white shadow-corporate">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-swg-line">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Mentor</th>
              <th className="px-4 py-3">Roll No.</th>
              <th className="px-4 py-3 text-right">Rating</th>
              <th className="px-4 py-3 text-right">Engagement</th>
              <th className="px-4 py-3 text-right">Final Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-swg-line text-sm">
            {rows.map((row, index) => {
              const rank = index + 1;
              return (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-full px-2 text-xs font-bold ${rankTone(rank)}`}
                    >
                      {rank <= 3 ? <Medal className="h-4 w-4" /> : null}
                      {rank}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-semibold text-swg-navy">
                    {row.mentors?.name ?? "Unknown mentor"}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {row.mentors?.roll_number ?? "-"}
                  </td>
                  <td className="px-4 py-4 text-right text-slate-700">
                    {formatRating(row.review)}
                  </td>
                  <td className="px-4 py-4 text-right text-slate-700">
                    {formatPercent(row.engagement_score)}
                  </td>
                  <td className="px-4 py-4 text-right text-base font-bold text-swg-blue">
                    {formatScore(row.final_score)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
