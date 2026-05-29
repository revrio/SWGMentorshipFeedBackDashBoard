import React from "react";
import { Star } from "lucide-react";
import { formatPercent, formatRating, formatScore } from "../lib/scoringUtils";

function rankTone(rank) {
  if (rank === 1) return "bg-rose-100 text-rose-700";
  if (rank === 2) return "bg-amber-100 text-amber-700";
  if (rank === 3) return "bg-swg-aqua text-swg-blue";
  return "bg-slate-100 text-slate-600";
}

function avatarTone(rank) {
  const tones = [
    "bg-rose-100 text-rose-700",
    "bg-amber-100 text-amber-700",
    "bg-cyan-100 text-cyan-700",
    "bg-fuchsia-100 text-fuchsia-700",
    "bg-violet-100 text-violet-700",
  ];
  return tones[(rank - 1) % tones.length];
}

export default function LeaderboardTable({ rows }) {
  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-dashed border-swg-line bg-white p-8 text-center text-sm text-slate-600 shadow-soft">
        No leaderboard snapshot is available for this view yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-swg-line bg-white shadow-corporate">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50 text-left text-xs font-bold text-slate-500">
            <tr>
              <th className="px-5 py-4">Rank</th>
              <th className="px-5 py-4">Mentor</th>
              <th className="px-5 py-4 text-right">Average Rating</th>
              <th className="px-5 py-4 text-right">Engagement Score</th>
              <th className="px-5 py-4 text-right">Final Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-swg-line text-sm">
            {rows.map((row, index) => {
              const rank = index + 1;
              const initials = (row.mentors?.name ?? "Mentor")
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              return (
                <tr key={row.id} className="bg-white hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-bold ${rankTone(rank)}`}
                    >
                      {rank}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-black ${avatarTone(rank)}`}
                      >
                        {initials}
                      </span>
                      <div>
                        <p className="font-bold text-swg-navy">
                          {row.mentors?.name ?? "Unknown mentor"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {row.mentors?.roll_number ?? "-"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <span className="hidden text-amber-400 sm:inline-flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            className="h-4 w-4 fill-current"
                            key={star}
                          />
                        ))}
                      </span>
                      <span className="rounded-full bg-swg-aqua px-3 py-1 font-bold text-swg-blue">
                        {formatRating(row.review).replace(" / 5", "")}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="rounded-full bg-swg-aqua px-3 py-1 font-bold text-swg-blue">
                      {formatPercent(row.engagement_score).replace("%", "")}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="rounded-full bg-slate-100 px-4 py-2 text-base font-bold text-swg-navy">
                      {formatScore(row.final_score).replace(" / 100", "")}
                    </span>
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
