import { Info, XCircle } from "lucide-react";

export const SquadListView = ({
  squad,
  saved,
  data,
  removePlayer,
  getShirtUrl,
  onPlayerSelect,
}) => {
  const statColumns = [
    { label: "Pts", key: "total_points", title: "Total Points" },
    { label: "MP", key: "minutes", title: "Minutes Played" },
    { label: "GS", key: "goals_scored", title: "Goals Scored" },
    { label: "A", key: "assists", title: "Assists" },
    { label: "CS", key: "clean_sheets", title: "Clean Sheets" },
    { label: "GC", key: "goals_conceded", title: "Goals Conceded" },
    { label: "OG", key: "own_goals", title: "Own Goals" },
    { label: "PS", key: "penalties_saved", title: "Penalties Saved" },
    { label: "PM", key: "penalties_missed", title: "Penalties Missed" },
    { label: "YC", key: "yellow_cards", title: "Yellow Cards" },
    { label: "RC", key: "red_cards", title: "Red Cards" },
  ];

  const positions = [
    { id: 1, label: "Goalkeeper" },
    { id: 2, label: "Defender" },
    { id: 3, label: "Midfielder" },
    { id: 4, label: "Forward" },
  ];

  const getTeamName = (teamId) => {
    return data.teams.find((t) => t.id === teamId)?.short_name || "-";
  };

  const getPosName = (typeId) => {
    const map = { 1: "GKP", 2: "DEF", 3: "MID", 4: "FWD" };
    return map[typeId] || "";
  };

  // Grid Layout: First col flexes, stats are fixed width
  const gridLayoutClass =
    "grid grid-cols-[minmax(250px,_1fr)_repeat(11,_3.5rem)] gap-0";

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 font-sans">
      <div className="overflow-x-auto">
        <div className="min-w-[850px]">
          {/* --- HEADER --- */}
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

          {/* --- BODY --- */}
          {positions.map((pos) => {
            const playersInPos = squad.filter((p) => p.element_type === pos.id);
            if (playersInPos.length === 0) return null;

            return (
              <div key={pos.id}>
                {/* Position Group Header */}
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/80 text-sm font-bold text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700 mt-0">
                  {pos.label}s
                </div>

                {playersInPos.map((p) => (
                  <div
                    key={p.id}
                    className={`${gridLayoutClass} border-b border-gray-100 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-gray-700/40 transition-colors items-center h-16 group`}
                  >
                    {/* COL 1: Player Info + Badge */}
                    <div className="pl-4 pr-4 flex items-center gap-3 h-full relative">
                      {/* Interactive Info Icon */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlayerSelect(p);
                        }}
                        className="text-gray-400 hover:text-blue-500 transition-colors z-10"
                      >
                        <Info size={18} />
                      </button>

                      {/* Shirt Image */}
                      <div className="w-8 h-8 shrink-0">
                        <img
                          src={getShirtUrl(
                            data.teams.find((t) => t.id === p.team) || [],
                            p.element_type === 1
                          )}
                          alt="kit"
                          className="object-contain w-full h-full"
                        />
                      </div>

                      {/* Name & Details */}
                      <div className="flex flex-col min-w-0 mr-2">
                        <span className="font-bold text-sm text-gray-800 dark:text-gray-100 truncate">
                          {p.web_name}
                        </span>
                        <div className="flex items-center text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          <span className="text-blue-600 dark:text-blue-400">
                            {getTeamName(p.team)}
                          </span>
                          <span className="mx-1 text-gray-300 dark:text-gray-600">
                            |
                          </span>
                          <span>{getPosName(p.element_type)}</span>
                        </div>
                      </div>

                      {/* --- CAPTAINCY BADGE --- */}
                      <div className="ml-auto flex items-center gap-2">
                        {(p.is_captain || p.is_vice_captain) && (
                          <div className="bg-black text-white text-[9px] sm:text-[10px] font-black w-4 h-4 sm:w-4.5 sm:h-4.5 flex items-center justify-center rounded-full border border-white z-30 shadow-sm">
                            {p.is_captain ? "C" : "V"}
                          </div>
                        )}

                        {/* Remove Button (Hover only) */}
                        {!saved && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removePlayer(p.id);
                            }}
                            className="text-gray-300 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all ml-2"
                            title="Remove Player"
                          >
                            <XCircle size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* STAT COLUMNS */}
                    {statColumns.map((col) => (
                      <div
                        key={col.key}
                        className="flex items-center justify-center text-sm text-gray-700 dark:text-gray-300 border-l border-gray-50 dark:border-gray-700/50 h-full"
                      >
                        {p[col.key]}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            );
          })}

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
