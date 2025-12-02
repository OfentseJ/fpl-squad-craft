import { Plus } from "lucide-react";
import PlayerShirt from "./PlayerShirt";
import { useEffect, useState, useMemo } from "react";
import PlayerDetailModal from "./PlayerDetailModal";
import { useFPLApi } from "../../hooks/useFPLApi";

// --- Sub-components ---

function HalfPitchBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none bg-[#00b159]">
      {/* Grass Pattern */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(0,0,0,0.05) 40px, rgba(0,0,0,0.05) 80px)",
        }}
      />
      {/* Pitch Lines */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 75"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0"
      >
        <g fill="none" stroke="white" strokeWidth="1" opacity="0.8">
          <path d="M 2 75 L 2 2 L 98 2 L 98 75" strokeWidth="1.5" />
          <line x1="0" y1="75" x2="100" y2="75" strokeWidth="2" />
          <path d="M 35 75 A 15 15 0 0 1 65 75" strokeWidth="1.5" />
          <circle cx="50" cy="75" r="1.5" fill="white" />
          <rect x="22" y="2" width="56" height="18" />
          <rect x="37" y="2" width="26" height="6" />
          <circle cx="50" cy="12" r="0.8" fill="white" />
          <path d="M 42 20 Q 50 26 58 20" />
          <path d="M 2 8 Q 8 8 8 2" />
          <path d="M 92 2 Q 92 8 98 8" />
        </g>
      </svg>
    </div>
  );
}

function Placeholder({ position, onClick, disabled }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`group flex flex-col items-center justify-center transition-transform z-10 ${
        disabled
          ? "opacity-50 cursor-not-allowed scale-95"
          : "cursor-pointer hover:scale-105"
      }`}
    >
      <div
        className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full border-2 flex items-center justify-center backdrop-blur-sm transition-all shadow-lg ${
          disabled
            ? "bg-gray-700/40 border-gray-500/30"
            : "bg-green-800/40 border-white/30 group-hover:bg-green-700/60 group-hover:border-white/80"
        }`}
      >
        <Plus
          className={`w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 ${
            disabled ? "text-gray-400" : "text-white/70 group-hover:text-white"
          }`}
        />
      </div>
      <div
        className={`mt-1 px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shadow-sm min-w-[50px] text-center ${
          disabled
            ? "bg-gray-800/80 text-gray-400"
            : "bg-green-900/80 text-white"
        }`}
      >
        {position}
      </div>
    </button>
  );
}

// --- Main Component ---

export default function Pitch({
  squad,
  saved,
  onRemovePlayer,
  onPlaceholderClick,
  onSubstitutePlayers,
}) {
  const [fixtures, setFixtures] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const { getFixtures } = useFPLApi();

  // 1. Fetch Fixtures (Fixed: Added dependency)
  useEffect(() => {
    let mounted = true;
    getFixtures().then((data) => {
      if (mounted) setFixtures(data);
    });
    return () => {
      mounted = false;
    };
  }, [getFixtures]);

  const handlePlayerClick = (player) => setSelectedPlayer(player);

  const handleSubstitute = (player1Id, player2Id) => {
    if (onSubstitutePlayers) onSubstitutePlayers(player1Id, player2Id);
    setSelectedPlayer(null);
  };

  const labelMap = { 1: "GKP", 2: "DEF", 3: "MID", 4: "FWD" };

  // 2. Organize Players based on "Saved" state
  const { pitchRows, benchPlayers } = useMemo(() => {
    // Separate squad by type for Pre-Save logic
    const gk = squad.filter((p) => p.element_type === 1);
    const def = squad.filter((p) => p.element_type === 2);
    const mid = squad.filter((p) => p.element_type === 3);
    const fwd = squad.filter((p) => p.element_type === 4);

    if (!saved) {
      // PRE-SAVE: Show all 15 slots on the pitch (2-5-5-3)
      // We explicitly fill arrays to the max limit to render placeholders
      return {
        pitchRows: [
          { type: 1, players: [...gk, ...Array(2 - gk.length).fill(null)] },
          { type: 2, players: [...def, ...Array(5 - def.length).fill(null)] },
          { type: 3, players: [...mid, ...Array(5 - mid.length).fill(null)] },
          { type: 4, players: [...fwd, ...Array(3 - fwd.length).fill(null)] },
        ],
        benchPlayers: [], // No bench in pre-save
      };
    } else {
      // POST-SAVE: Dynamic Formation
      // We assume the Parent Component has sorted `squad` such that:
      // Indices 0-10 = Starting XI
      // Indices 11-14 = Bench
      const starters = squad.slice(0, 11);
      const subs = squad.slice(11, 15);

      // Dynamically calculate formation based on who is in the Starting XI
      const startGK = starters.filter((p) => p.element_type === 1);
      const startDEF = starters.filter((p) => p.element_type === 2);
      const startMID = starters.filter((p) => p.element_type === 3);
      const startFWD = starters.filter((p) => p.element_type === 4);

      return {
        pitchRows: [
          { type: 1, players: startGK },
          { type: 2, players: startDEF },
          { type: 3, players: startMID },
          { type: 4, players: startFWD },
        ],
        benchPlayers: subs,
      };
    }
  }, [squad, saved]);

  // Helper to render a row of players/placeholders
  const renderRow = (rowObj, rowIndex) => {
    return rowObj.players.map((p, i) => {
      // Unique key generation to prevent React warnings
      const key = p
        ? `player-${p.id}`
        : `placeholder-${rowObj.type}-${rowIndex}-${i}`;

      return p ? (
        <PlayerShirt
          key={key}
          player={p}
          onClick={() => handlePlayerClick(p)}
          inPitch={true} // Always "in pitch" relative to this specific container
          fixtures={fixtures}
        />
      ) : (
        <Placeholder
          key={key}
          position={labelMap[rowObj.type]}
          onClick={() => onPlaceholderClick(rowObj.type)}
        />
      );
    });
  };

  return (
    <>
      <div className="w-full mx-auto max-w-md sm:max-w-xl md:max-w-3xl">
        {/* PITCH AREA */}
        <div className="relative w-full aspect-3/4 sm:aspect-4/3 rounded-xl overflow-hidden shadow-2xl border-4 border-white bg-[#00b159]">
          <HalfPitchBackground />

          <div className="relative h-full flex flex-col justify-between py-4 sm:py-6 z-10 px-1 sm:px-4">
            {/* Goalkeeper Row */}
            <div className="flex justify-center pt-1 sm:pt-2 gap-8">
              {renderRow(pitchRows[0], 0)}
            </div>

            {/* Defender Row */}
            <div className="flex justify-center items-center gap-2 sm:gap-6">
              {renderRow(pitchRows[1], 1)}
            </div>

            {/* Midfielder Row */}
            <div className="flex justify-center items-center gap-2 sm:gap-6">
              {renderRow(pitchRows[2], 2)}
            </div>

            {/* Forward Row */}
            <div className="flex justify-center items-end gap-6 sm:gap-8 pb-2 sm:pb-4">
              {renderRow(pitchRows[3], 3)}
            </div>
          </div>
        </div>

        {/* BENCH AREA (Only visible when Saved) */}
        {saved && benchPlayers.length > 0 && (
          <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-200 dark:border-gray-700">
            <div className="text-[10px] font-bold text-center text-gray-400 uppercase tracking-widest mb-2">
              Substitutes
            </div>
            <div className="flex justify-center gap-2 sm:gap-4">
              {benchPlayers.map((p, i) => {
                // Determine accurate label
                let label = "SUB";
                if (p) label = labelMap[p.element_type];
                else if (i === 0) label = "GKP"; // Slot 1 is always GKP

                return (
                  <div
                    key={p ? p.id : `bench-${i}`}
                    className="flex flex-col items-center"
                  >
                    <div className="text-[8px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                      {label}
                    </div>
                    {p ? (
                      <PlayerShirt
                        player={p}
                        onClick={() => handlePlayerClick(p)}
                        inPitch={false}
                        fixtures={fixtures}
                      />
                    ) : (
                      // Fallback if bench has empty slots (shouldn't happen in saved state usually)
                      <div className="w-12 h-16 sm:w-14 sm:h-18 md:w-16 md:h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
                        <span className="text-gray-300 text-[10px]">—</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {selectedPlayer && (
        <PlayerDetailModal
          player={selectedPlayer}
          squad={squad}
          fixtures={fixtures}
          onClose={() => setSelectedPlayer(null)}
          onRemove={onRemovePlayer}
          onSubstitute={handleSubstitute}
          isSavedState={saved}
        />
      )}
    </>
  );
}
