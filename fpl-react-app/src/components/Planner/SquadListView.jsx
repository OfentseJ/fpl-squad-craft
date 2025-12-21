import { useEffect, useState, useMemo } from "react";
import { Info, XCircle, ArrowLeftRight } from "lucide-react";
import { useFPLApi } from "../../hooks/useFplApi";

export const SquadListView = ({
  squad,
  saved,
  data,
  removePlayer,
  getShirtUrl,
  onPlayerSelect,
  gameweekId,
  substitutionSource,
  onSubstituteComplete,
  isSubstitutionValid,
}) => {
  const { getFixtures } = useFPLApi();
  const [fixtures, setFixtures] = useState([]);
  const [loadingFixtures, setLoadingFixtures] = useState(true);

  // 1. Fetch Fixtures on Mount
  useEffect(() => {
    const fetchFixtureData = async () => {
      try {
        const fixtureData = await getFixtures();
        setFixtures(fixtureData);
      } catch (err) {
        console.error("Failed to load fixtures", err);
      } finally {
        setLoadingFixtures(false);
      }
    };

    fetchFixtureData();
  }, [getFixtures]);

  // Determine if the SOURCE player is a starter (Index < 11)
  const sourceIndex = useMemo(
    () => squad.findIndex((p) => p.id === substitutionSource),
    [squad, substitutionSource]
  );
  const sourceIsStarter = sourceIndex >= 0 && sourceIndex < 11;

  // --- FDR COLOR HELPER ---
  const getFDRClass = (diff) => {
    if (!diff || diff === 0)
      return "bg-gray-100 dark:bg-gray-700 text-gray-400"; // Default/Blank
    if (diff <= 2) return "bg-[#01fc7a] text-black border border-green-600"; // Green (Easy)
    if (diff === 3) return "bg-gray-200 text-black border border-gray-300"; // Grey (Medium)
    if (diff === 4) return "bg-[#ff1751] text-white border border-red-600"; // Red (Hard)
    return "bg-[#80072d] text-white border border-red-900"; // Dark Red (Very Hard)
  };

  // 2. Create a Map of TeamID -> Fixture Object { text, cssClass }
  const fixtureMap = useMemo(() => {
    if (!fixtures.length || !data?.teams) return {};

    const map = {};

    const getShortName = (id) =>
      data.teams.find((t) => t.id === id)?.short_name || "UNK";

    data.teams.forEach((team) => {
      const teamFixtures = fixtures.filter(
        (f) => f.team_h === team.id || f.team_a === team.id
      );

      let relevantFixture = null;

      if (gameweekId) {
        relevantFixture = teamFixtures.find(
          (f) => f.event === Number(gameweekId)
        );
      } else {
        relevantFixture = teamFixtures.find((f) => !f.finished);
      }

      let display = "—";
      let difficulty = 0;

      if (relevantFixture) {
        const isHome = relevantFixture.team_h === team.id;
        const opponentId = isHome
          ? relevantFixture.team_a
          : relevantFixture.team_h;

        const opponentName = getShortName(opponentId);

        difficulty = isHome
          ? relevantFixture.team_h_difficulty
          : relevantFixture.team_a_difficulty;

        display = isHome ? `${opponentName} (H)` : `${opponentName} (A)`;
      }

      map[team.id] = {
        label: display,
        className: getFDRClass(difficulty),
      };
    });

    return map;
  }, [fixtures, data, gameweekId]);

  // --- Definitions ---
  const statColumns = [
    { label: "Form", key: "form", title: "Current Form" },
    { label: "GW", key: "event_points", title: "Last Gameweek Points" },
    { label: "Pts", key: "total_points", title: "Total Points" },
    { label: "Fix", key: "next_fixture", title: "Fixture" },
  ];

  const positions = [
    { id: 1, label: "Goalkeeper" },
    { id: 2, label: "Defender" },
    { id: 3, label: "Midfielder" },
    { id: 4, label: "Forward" },
  ];

  const starters = squad.slice(0, 11);
  const bench = squad.slice(11, 15);

  const getTeamName = (teamId) => {
    return data.teams.find((t) => t.id === teamId)?.short_name || "-";
  };

  const getPosName = (typeId) => {
    const map = { 1: "GKP", 2: "DEF", 3: "MID", 4: "FWD" };
    return map[typeId] || "";
  };

  const gridLayoutClass =
    "grid grid-cols-[minmax(250px,_1fr)_4rem_4rem_4rem_6rem] gap-0";

  const headerStyle =
    "px-4 py-2 bg-gray-50 dark:bg-gray-800/80 text-sm font-bold text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700 mt-0";

  // --- Row Component ---
  // Added Prop: isStarterRow
  const PlayerRow = ({ p, isStarterRow }) => {
    const fixtureData = fixtureMap[p.team] || { label: "-", className: "" };

    // --- SUBSTITUTION LOGIC ---
    const isSubSource = substitutionSource === p.id;
    let isValidTarget = true;
    let rowClassName = "hover:bg-green-50 dark:hover:bg-gray-700/40"; // Default

    if (substitutionSource) {
      if (p.id === substitutionSource) {
        rowClassName =
          "bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-l-yellow-400";
        isValidTarget = true;
      } else {
        // 1. Check strict rules (Formation, etc.)
        const rulesValid = isSubstitutionValid(substitutionSource, p.id);

        // 2. Check STARTER <-> STARTER blocking rule
        // If Source is Starter AND Target is Starter -> Invalid
        const isStarterSwap = sourceIsStarter && isStarterRow;

        isValidTarget = rulesValid && !isStarterSwap;

        if (isValidTarget) {
          rowClassName =
            "cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 animate-pulse-slow";
        } else {
          rowClassName = "opacity-40 grayscale cursor-not-allowed";
        }
      }
    }

    const showSwapIcon = substitutionSource && isValidTarget && !isSubSource;

    return (
      <div
        onClick={() => {
          if (substitutionSource) {
            if (isValidTarget) onSubstituteComplete(p.id);
          } else {
            onPlayerSelect(p);
          }
        }}
        className={`${gridLayoutClass} border-b border-gray-100 dark:border-gray-700 transition-all items-center h-16 group ${rowClassName} relative`}
      >
        {/* COL 1: Player Info + Badge */}
        <div className="pl-4 pr-4 flex items-center gap-3 h-full relative overflow-hidden">
          {/* --- ICON TOGGLE --- */}
          {showSwapIcon ? (
            <div className="mr-1 z-10 text-green-600 dark:text-green-400 animate-pulse">
              <ArrowLeftRight
                size={20}
                className="bg-white dark:bg-gray-800 rounded-full shadow-sm"
              />
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlayerSelect(p);
              }}
              className="text-gray-400 hover:text-blue-500 transition-colors z-10 mr-1"
            >
              <Info size={18} />
            </button>
          )}

          {/* --- SHIRT IMAGE --- */}
          <div className="w-9 h-9 shrink-0 relative">
            <img
              src={getShirtUrl(
                data.teams.find((t) => t.id === p.team) || [],
                p.element_type === 1
              )}
              alt="kit"
              className="object-contain w-full h-full"
            />
            {isSubSource && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-white animate-bounce" />
            )}
          </div>

          {/* --- NAME & DETAILS --- */}
          <div className="flex flex-col min-w-0 mr-2">
            <span className="font-bold text-sm text-gray-800 dark:text-gray-100 truncate">
              {p.web_name}
            </span>
            <div className="flex items-center text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <span className="text-blue-600 dark:text-blue-400 font-semibold">
                {getTeamName(p.team)}
              </span>
              <span className="mx-1 text-gray-300 dark:text-gray-600">|</span>
              <span>{getPosName(p.element_type)}</span>
            </div>
          </div>

          {/* --- BADGES --- */}
          <div className="ml-auto flex items-center gap-2">
            {(p.is_captain || p.is_vice_captain) && (
              <div className="bg-black text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border border-white shadow-sm z-20">
                {p.is_captain ? "C" : "V"}
              </div>
            )}
            {!saved && !substitutionSource && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removePlayer(p.id);
                }}
                className="text-gray-300 hover:text-red-500 transition-colors ml-1"
              >
                <XCircle size={18} />
              </button>
            )}
          </div>
        </div>

        {/* --- STATS --- */}
        <div className="flex items-center justify-center text-sm text-gray-700 dark:text-gray-300 h-full">
          {p.form}
        </div>
        <div className="flex items-center justify-center text-sm font-bold text-gray-900 dark:text-white h-full bg-gray-50 dark:bg-gray-800/50">
          {p.event_points}
        </div>
        <div className="flex items-center justify-center text-sm text-gray-700 dark:text-gray-300 h-full">
          {p.total_points}
        </div>

        {/* --- FIXTURE --- */}
        <div className="flex items-center justify-center h-full px-2">
          {loadingFixtures ? (
            <span className="animate-pulse text-gray-400">...</span>
          ) : (
            <div
              className={`px-2 py-1 rounded text-xs font-bold w-full text-center truncate ${fixtureData.className}`}
            >
              {fixtureData.label}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 font-sans">
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Header */}
          <div
            className={`${gridLayoutClass} bg-gray-100 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3`}
          >
            <div className="pl-4 flex items-center">Player</div>
            {statColumns.map((col) => (
              <div
                key={col.key}
                className="flex items-center justify-center text-center"
                title={col.title}
              >
                {col.label}
              </div>
            ))}
          </div>

          {/* Starters */}
          {positions.map((pos) => {
            const playersInPos = starters.filter(
              (p) => p.element_type === pos.id
            );
            if (playersInPos.length === 0) return null;

            return (
              <div key={`starter-pos-${pos.id}`}>
                <div className={headerStyle}>{pos.label}s</div>
                {playersInPos.map((p) => (
                  <PlayerRow key={p.id} p={p} isStarterRow={true} />
                ))}
              </div>
            );
          })}

          {/* Substitutes */}
          {bench.length > 0 && (
            <div className="border-t-4 border-gray-200 dark:border-gray-900">
              <div className={headerStyle}>Substitutes</div>
              {bench.map((p) => (
                <PlayerRow key={p.id} p={p} isStarterRow={false} />
              ))}
            </div>
          )}

          {squad.length === 0 && (
            <div className="p-12 text-center text-gray-400 dark:text-gray-500 italic">
              No players in squad. Switch to Pitch View to add players.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
