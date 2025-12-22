import { Crown, TrendingUp, User } from "lucide-react";

export default function TeamInfoBanner({ teamInfo }) {
  if (!teamInfo) return null;

  const {
    name,
    player_first_name,
    player_last_name,
    summary_overall_rank,
    summary_overall_points,
    summary_event_rank,
  } = teamInfo;

  const fmt = (num) => new Intl.NumberFormat().format(num || 0);

  return (
    <div className="w-full max-w-md sm:max-w-xl md:max-w-3xl mx-auto mb-6">
      <div className="bg-linear-to-r from-purple-900 to-indigo-900 rounded-xl shadow-lg p-4 text-white flex flex-col sm:flex-row justify-between items-center gap-4 border border-purple-500/30">
        {/* Manager Info */}
        <div className="flex items-center gap-3">
          <div className="bg-purple-800 p-3 rounded-full border border-purple-400">
            <User size={24} className="text-purple-200" />
          </div>
          <div>
            <h2 className="text-lg font-bold leading-tight">{name}</h2>
            <p className="text-xs text-purple-200 font-medium">
              {player_first_name} {player_last_name}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="flex gap-6 text-center">
          {/* Total Points */}
          <div>
            <div className="text-[10px] uppercase tracking-wider text-purple-300 font-bold mb-0.5">
              Total Pts
            </div>
            <div className="text-xl font-black">
              {fmt(summary_overall_points)}
            </div>
          </div>

          {/* Overall Rank */}
          <div>
            <div className="text-[10px] uppercase tracking-wider text-purple-300 font-bold mb-0.5 flex items-center justify-center gap-1">
              <Crown size={10} /> Rank
            </div>
            <div className="text-xl font-black">
              {fmt(summary_overall_rank)}
            </div>
          </div>

          {/* GW Rank (Optional) */}
          <div className="hidden sm:block">
            <div className="text-[10px] uppercase tracking-wider text-purple-300 font-bold mb-0.5 flex items-center justify-center gap-1">
              <TrendingUp size={10} /> GW Rank
            </div>
            <div className="text-xl font-black text-purple-100">
              {summary_event_rank ? fmt(summary_event_rank) : "-"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
