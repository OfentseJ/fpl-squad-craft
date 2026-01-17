import { Calculator, Coins, TrendingUp } from "lucide-react";

export default function PlanningStatsBanner({ squad }) {
  // We only care about the starting 11 for active points
  const starters = squad.slice(0, 11);

  const stats = starters.reduce(
    (acc, player) => {
      if (player.is_placeholder) return acc;

      // Calculate Cost (now_cost is usually in tenths, e.g., 125 = 12.5)
      acc.cost += player.now_cost ? player.now_cost / 10 : 0;

      // Calculate Expected Points (support ep_next or generic expected_points)
      // FPL API returns ep_next as a string, so we parse it.
      let xp = parseFloat(player.ep_next || player.expected_points || 0);

      // handle Captain multiplier
      if (player.is_captain) xp *= 2;
      // Vice captain logic is complex (requires captain not playing),
      // usually excluded from simple xP planning sums unless captain is injured.

      acc.xp += xp;

      return acc;
    },
    { cost: 0, xp: 0 }
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 mb-4 flex items-center justify-between">
      {/* Left: Label */}
      <div className="flex items-center gap-2">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
          <Calculator size={18} />
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Planning Mode
          </h3>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            Gameweek Preview
          </p>
        </div>
      </div>

      {/* Right: Stats Grid */}
      <div className="flex items-center gap-4 sm:gap-8">
        {/* Team Value (Starters) */}
        <div className="text-right">
          <div className="flex items-center justify-end gap-1 text-[10px] text-gray-500 uppercase font-bold">
            <Coins size={12} />
            <span>Cost</span>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white leading-none">
            £{stats.cost.toFixed(1)}m
          </div>
        </div>

        {/* Expected Points */}
        <div className="text-right">
          <div className="flex items-center justify-end gap-1 text-[10px] text-gray-500 uppercase font-bold">
            <TrendingUp size={12} />
            <span>Exp. Points</span>
          </div>
          <div className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 leading-none">
            {stats.xp.toFixed(1)}
          </div>
        </div>
      </div>
    </div>
  );
}
