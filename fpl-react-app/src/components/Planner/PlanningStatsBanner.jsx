import { Calculator, TrendingUp } from "lucide-react";

export default function PlanningStatsBanner({
  squad,
  fixtures = [],
  gameweekId,
}) {
  // We only care about the starting 11 for active points
  const starters = squad.slice(0, 11);

  // Helper: Estimate xP based on Difficulty
  // FPL Difficulty is 1 (Easy) to 5 (Hard)
  const calculateFixtureXp = (difficulty, role) => {
    // Base "Appearance" points (2) + some probability of return
    let base = 3.5;

    // Adjust based on role (Defenders suffer more from hard fixtures due to CS loss)
    if (role === 1 || role === 2) {
      // GK or DEF
      if (difficulty <= 2) base += 2.5; // Likely Clean Sheet
      else if (difficulty === 3) base += 0.5;
      else base -= 1.0; // Hard game
    } else {
      // MID or FWD
      if (difficulty <= 2) base += 2.0; // Likely return
      else if (difficulty === 3) base += 0.5;
      else base -= 0.5;
    }

    return Math.max(0, base); // Ensure no negative points
  };

  // Calculate Total Expected Points
  const totalXp = starters.reduce((acc, player) => {
    if (player.is_placeholder) return acc;

    // 1. Find Player's Fixtures for this specific Gameweek
    const playerFixtures = fixtures.filter(
      (f) =>
        f.event === Number(gameweekId) &&
        (f.team_h === player.team || f.team_a === player.team)
    );

    let calculatedXp = 0;

    if (playerFixtures.length === 0) {
      // BLANK GAMEWEEK (No match) -> 0 Points
      calculatedXp = 0;
    } else {
      // Calculate for each match (handles Double Gameweeks automatically by summing them)
      playerFixtures.forEach((fix) => {
        const isHome = fix.team_h === player.team;
        // Get the difficulty of the OPPONENT
        const difficulty = isHome
          ? fix.team_h_difficulty
          : fix.team_a_difficulty;

        calculatedXp += calculateFixtureXp(difficulty, player.element_type);
      });
    }

    // Handle Captain Multiplier
    if (player.is_captain) calculatedXp *= 2;

    return acc + calculatedXp;
  }, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4 flex items-center justify-between transition-all">
      {/* Left Side: Label & Icon */}
      <div className="flex items-center gap-3">
        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg text-green-600 dark:text-green-400">
          <Calculator size={20} />
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            GW {gameweekId} Plan
          </h3>
          <p className="text-base font-bold text-gray-900 dark:text-white">
            Projected Points
          </p>
        </div>
      </div>

      {/* Right Side: Big Number */}
      <div className="flex items-center gap-2">
        <TrendingUp size={18} className="text-green-500 animate-pulse" />
        <div className="text-4xl font-black bg-clip-text text-green-400 leading-none drop-shadow-sm">
          {totalXp.toFixed(1)}
        </div>
      </div>
    </div>
  );
}
