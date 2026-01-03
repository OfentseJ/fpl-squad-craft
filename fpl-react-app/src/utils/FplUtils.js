export function getCurrentGameweek(events) {
  if (!events) return null;

  const current = events.find((e) => e.is_current);
  const next = events.find((e) => e.is_next);

  return current || next || events[0];
}

export const calculateCleanSheetProbability = (team, opponent, isHome) => {
  if (!team || !opponent) return 0;

  const AVG_GOALS_HOME = 1.55;
  const AVG_GOALS_AWAY = 1.2;
  const LEAGUE_AVG_STRENGTH = 1050;

  const baseLeagueGoals = isHome ? AVG_GOALS_AWAY : AVG_GOALS_HOME;

  const oppAttackStrength = isHome
    ? opponent.strength_attack_away
    : opponent.strength_attack_home;

  const teamDefStrength = isHome
    ? team.strength_defence_home
    : team.strength_defence_away;

  const xGC =
    baseLeagueGoals *
    (oppAttackStrength / LEAGUE_AVG_STRENGTH) *
    (LEAGUE_AVG_STRENGTH / teamDefStrength);

  return Math.exp(-xGC);
};

export const getRankedDefenses = (teams, fixtures, currentGw) => {
  return teams
    .map((team) => {
      const teamFixtures = fixtures
        .filter((f) => !f.finished && f.event >= currentGw)
        .filter((f) => f.team_h === team.id || f.team_a === team.id)
        .sort((a, b) => a.event - b.event)
        .slice(0, 5);

      let totalXCS = 0;
      const matchDetails = teamFixtures.map((fix) => {
        const isHome = fix.team_h === team.id;
        const opponentId = isHome ? fix.team_a : fix.team_h;
        const opponent = teams.find((t) => t.id === opponentId);

        const prob = calculateCleanSheetProbability(team, opponent, isHome);
        totalXCS += prob;

        return {
          event: fix.event,
          opponent,
          isHome,
          prob,
        };
      });

      return {
        team,
        totalXCS,
        matchDetails,
      };
    })
    .sort((a, b) => b.totalXCS - a.totalXCS);
};

export const getRankedAttacks = (teams, fixtures, startGw) => {
  // 1. Filter fixtures for next 5 GWs
  // 2. Loop through teams
  // 3. Calculate Projected Goals based on:
  //    (Team Attack Strength + Opponent Def Weakness) * (Home/Away Factor)
  // Return shape should be:
  // [
  //   {
  //     team: { ...teamObject },
  //     totalXG: 10.5,
  //     matchDetails: [
  //       {
  //         opponent: { short_name: "ARS" },
  //         isHome: true,
  //         projectedGoals: 1.2
  //       },
  //       ...
  //     ]
  //   }
  // ]
  // .sort((a, b) => b.totalXG - a.totalXG);
};

export const getFDRClass = (diff) => {
  if (diff <= 2) return "bg-[#01fc7a] text-black border-green-600"; // Easy (Green)
  if (diff === 3) return "bg-gray-200 text-gray-900 border-gray-300"; // Med (Grey)
  if (diff === 4) return "bg-[#ff1751] text-white border-red-600"; // Hard (Red)
  return "bg-[#80072d] text-white border-red-900"; // Tough (Dark Red)
};

export const getProbColor = (prob) => {
  if (prob >= 0.5) return "bg-green-500 text-white";
  if (prob >= 0.35) return "bg-green-100 text-green-800";
  if (prob >= 0.2) return "bg-gray-100 text-gray-800";
  return "bg-red-50 text-red-600";
};

export const getGoalColor = (goals) => {
  if (goals >= 2.5)
    return "bg-green-100 border-green-200 text-green-800 dark:bg-green-900/40 dark:border-green-800 dark:text-green-300"; // Haul potential
  if (goals >= 1.8)
    return "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/40 dark:border-blue-800 dark:text-blue-300"; // Good
  if (goals >= 1.2)
    return "bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"; // Average
  return "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/40 dark:border-red-800 dark:text-red-300"; // Poor
};
