import { X, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { useFPLApi } from "../hooks/useFPLApi";

export default function PlayerCompareModal({
  player1,
  allPlayers,
  teams,
  onClose,
}) {
  const [player2Id, setPlayer2Id] = useState("");
  const [search, setSearch] = useState("");
  const { getPlayerImageUrl } = useFPLApi();

  // Find Player 2 Object
  const player2 = allPlayers.find((p) => p.id.toString() === player2Id);

  // Filter list for Player 2 dropdown
  const filteredPlayers = useMemo(() => {
    if (!search) return [];
    return allPlayers
      .filter(
        (p) =>
          p.element_type === player1.element_type && // Same position only
          p.id !== player1.id &&
          (p.web_name.toLowerCase().includes(search.toLowerCase()) ||
            p.first_name.toLowerCase().includes(search.toLowerCase()) ||
            p.second_name.toLowerCase().includes(search.toLowerCase())),
      )
      .slice(0, 5);
  }, [search, allPlayers, player1]);

  const StatRow = ({ label, val1, val2, highIsGood = true }) => {
    const v1 = parseFloat(val1);
    const v2 = parseFloat(val2);
    // Simple highlight logic
    const p1Better = highIsGood ? v1 > v2 : v1 < v2;
    const p2Better = highIsGood ? v2 > v1 : v2 < v1;
    const equal = v1 === v2;

    return (
      <div className="flex items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
        <div
          className={`flex-1 text-right font-mono ${p1Better ? "text-green-600 font-bold" : "text-gray-600 dark:text-gray-400"}`}
        >
          {val1}
        </div>
        <div className="px-4 text-xs font-semibold text-gray-400 uppercase text-center w-24">
          {label}
        </div>
        <div
          className={`flex-1 text-left font-mono ${p2Better ? "text-green-600 font-bold" : "text-gray-600 dark:text-gray-400"}`}
        >
          {val2 || "-"}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
          <h3 className="font-bold text-lg">Compare Players</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Players Header */}
        <div className="grid grid-cols-2 gap-4 p-6 bg-linear-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
          {/* Player 1 (Selected) */}
          <div className="flex flex-col items-center">
            <img
              src={getPlayerImageUrl(player1.code)}
              className="w-20 h-20 object-contain drop-shadow-md"
            />
            <p className="font-bold mt-2 text-center">{player1.web_name}</p>
            <span className="text-xs text-gray-500">
              £{(player1.now_cost / 10).toFixed(1)}m
            </span>
          </div>

          {/* Player 2 (Search) */}
          <div className="flex flex-col items-center justify-center relative">
            {player2 ? (
              <>
                <div className="absolute top-0 right-0">
                  <button
                    onClick={() => {
                      setPlayer2Id("");
                      setSearch("");
                    }}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Change
                  </button>
                </div>
                <img
                  src={getPlayerImageUrl(player2.code)}
                  className="w-20 h-20 object-contain drop-shadow-md"
                />
                <p className="font-bold mt-2 text-center">{player2.web_name}</p>
                <span className="text-xs text-gray-500">
                  £{(player2.now_cost / 10).toFixed(1)}m
                </span>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="relative w-full">
                  <Search
                    className="absolute left-3 top-2.5 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Compare with..."
                    className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:ring-2 ring-blue-500 outline-none"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {/* Dropdown Results */}
                  {filteredPlayers.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 shadow-xl border dark:border-gray-700 rounded-lg mt-1 z-10 max-h-48 overflow-y-auto">
                      {filteredPlayers.map((p) => (
                        <div
                          key={p.id}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2"
                          onClick={() => {
                            setPlayer2Id(p.id.toString());
                            setSearch("");
                          }}
                        >
                          <img
                            src={getPlayerImageUrl(p.code)}
                            className="w-6 h-6"
                          />
                          <span className="text-sm truncate">{p.web_name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Search same position
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Comparison */}
        <div className="p-4 overflow-y-auto flex-1 bg-white dark:bg-gray-900">
          {player2 ? (
            <div className="space-y-1">
              <StatRow
                label="Points"
                val1={player1.total_points}
                val2={player2.total_points}
              />
              <StatRow label="Form" val1={player1.form} val2={player2.form} />
              <StatRow
                label="G/A"
                val1={player1.goals_scored + player1.assists}
                val2={player2.goals_scored + player2.assists}
              />
              <StatRow
                label="xG"
                val1={player1.expected_goals}
                val2={player2.expected_goals}
              />
              <StatRow
                label="xA"
                val1={player1.expected_assists}
                val2={player2.expected_assists}
              />
              <StatRow
                label="ICT Index"
                val1={player1.ict_index}
                val2={player2.ict_index}
              />
              <StatRow
                label="Selected %"
                val1={player1.selected_by_percent}
                val2={player2.selected_by_percent}
              />
              <StatRow label="BPS" val1={player1.bps} val2={player2.bps} />
            </div>
          ) : (
            <div className="text-center text-gray-400 py-10">
              Select a second player to view comparison
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
