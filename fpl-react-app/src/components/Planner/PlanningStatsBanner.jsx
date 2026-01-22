import { Calculator, TrendingUp } from "lucide-react";
import { useMemo } from "react";

// Helper: Estimate xP based on Difficulty (Defined outside component)
// FPL Difficulty is 1 (Easy) to 5 (Hard)
const calculateFixtureXp = (difficulty, role) => {
  // Base "Appearance" points (2) + some probability of return
  let base = 3.5;

  // Adjust based on role (Defenders suffer more from hard fixtures due to CS loss)
  if (role === 1 || role === 2) {
    // GK or DEF
    if (difficulty <= 2)
      base += 2.5; // Likely Clean Sheet
    else if (difficulty === 3) base += 0.5;
    else base -= 1.0; // Hard game
  } else {
    // MID or FWD
    if (difficulty <= 2)
      base += 2.0; // Likely return
    else if (difficulty === 3) base += 0.5;
    else base -= 0.5;
  }

  return Math.max(0, base); // Ensure no negative points
};

export default function PlanningStatsBanner({
  squad,
  fixtures = [],
  gameweekId,
}) {
  // Calculate Totals (Starters vs Bench)
  const { totalXp, benchXp } = useMemo(() => {
    if (!squad || squad.length === 0) {
      return { totalXp: 0, benchXp: 0 };
    }

    const calculateGroupXp = (players) => {
      return players.reduce((acc, player) => {
        if (player.is_placeholder) return acc;

        // 1. Find Player's Fixtures for this specific Gameweek
        const playerFixtures = fixtures.filter(
          (f) =>
            f.event === Number(gameweekId) &&
            (f.team_h === player.team || f.team_a === player.team),
        );

        let calculatedXp = 0;

        if (playerFixtures.length === 0) {
          calculatedXp = 0; // Blank GW
        } else {
          // Calculate for each match (handles Double Gameweeks)
          playerFixtures.forEach((fix) => {
            const isHome = fix.team_h === player.team;
            // Get the difficulty of the OPPONENT
            const difficulty = isHome
              ? fix.team_h_difficulty
              : fix.team_a_difficulty;

            calculatedXp += calculateFixtureXp(difficulty, player.element_type);
          });
        }

        // Handle Captain Multiplier (only relevant for starters usually, but good practice)
        if (player.is_captain) calculatedXp *= 2;

        return acc + calculatedXp;
      }, 0);
    };

    // 1. Calculate Starters (Indices 0-10)
    const starters = squad.slice(0, 11);
    const calculatedTotal = calculateGroupXp(starters);

    // 2. Calculate Bench (Indices 11-14)
    const bench = squad.slice(11, 15);
    const calculatedBench = calculateGroupXp(bench);

    return {
      totalXp: calculatedTotal,
      benchXp: calculatedBench,
    };
  }, [squad, fixtures, gameweekId]);

  if (!squad || squad.length === 0) return null;

  return (
    <div className="w-full max-w-md sm:max-w-xl md:max-w-3xl mx-auto mb-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-3 flex justify-between items-center">
        {/* Left: Total Projected Score */}
        <div className="flex items-center gap-3">
          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg text-green-600 dark:text-green-400">
            <Calculator size={20} />
          </div>
          <div>
            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
              GW{gameweekId} Projected
            </div>
            <div className="text-2xl font-black text-green-500 leading-none">
              {totalXp.toFixed(1)}
            </div>
          </div>
        </div>

        {/* Right: Meta Info */}
        <div className="flex gap-4 text-right">
          {/* Forecast Indicator (Replaces "Played" from live view) */}
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 text-[10px] text-gray-400 uppercase font-bold">
              Forecast
            </div>
            <div className="font-bold text-green-500 dark:text-green-400">
              <TrendingUp size={18} />
            </div>
          </div>

          {/* Bench XP (Replaces "Bench Points" from live view) */}
          <div className="flex flex-col items-end border-l pl-4 border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-1 text-[10px] text-gray-400 uppercase font-bold">
              Bench xP
            </div>
            <div className="font-bold text-gray-500 dark:text-gray-400">
              {benchXp.toFixed(1)} pts
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
