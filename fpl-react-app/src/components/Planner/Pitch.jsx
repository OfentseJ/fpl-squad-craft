import { Plus, ArrowLeftRight } from "lucide-react";
import PlayerShirt from "./PlayerShirt";
import { useEffect, useState, useMemo } from "react";
import { useFPLApi } from "../../hooks/useFplApi";

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
          ? "opacity-30 cursor-not-allowed scale-95 grayscale"
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
  onPlaceholderClick,
  // Substitution props
  substitutionSource,
  onSubstituteComplete,
  isSubstitutionValid,
  onPlayerSelect,
}) {
  const [fixtures, setFixtures] = useState([]);
  const { getFixtures } = useFPLApi();

  useEffect(() => {
    let mounted = true;
    getFixtures().then((data) => {
      if (mounted) setFixtures(data);
    });
    return () => {
      mounted = false;
    };
  }, [getFixtures]);

  const handlePlayerClick = (player) => {
    if (substitutionSource) {
      onSubstituteComplete(player.id);
      return;
    }

    onPlayerSelect(player);
  };

  const labelMap = { 1: "GKP", 2: "DEF", 3: "MID", 4: "FWD" };

  const { pitchRows, benchPlayers } = useMemo(() => {
    const gk = squad.filter((p) => p.element_type === 1);
    const def = squad.filter((p) => p.element_type === 2);
    const mid = squad.filter((p) => p.element_type === 3);
    const fwd = squad.filter((p) => p.element_type === 4);

    if (!saved) {
      // PRE-SAVE: Show all 15 slots
      return {
        pitchRows: [
          { type: 1, players: [...gk, ...Array(2 - gk.length).fill(null)] },
          { type: 2, players: [...def, ...Array(5 - def.length).fill(null)] },
          { type: 3, players: [...mid, ...Array(5 - mid.length).fill(null)] },
          { type: 4, players: [...fwd, ...Array(3 - fwd.length).fill(null)] },
        ],
        benchPlayers: [],
      };
    } else {
      // POST-SAVE: Formation Logic
      const starters = squad.slice(0, 11);
      const subs = squad.slice(11, 15);

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

  // Helper to render a row
  const renderRow = (rowObj, rowIndex) => {
    return rowObj.players.map((p, i) => {
      const key = p
        ? `player-${p.id}`
        : `placeholder-${rowObj.type}-${rowIndex}-${i}`;

      // --- LOGIC FOR VISUAL FEEDBACK ---
      const isSubSource = substitutionSource === p?.id;

      // If a source is selected, is this specific player a valid target?
      let isValidTarget = true;
      if (substitutionSource) {
        if (!p) {
          isValidTarget = false; // Cannot swap with empty slot
        } else if (p.id === substitutionSource) {
          isValidTarget = true; // Can click self to cancel
        } else {
          isValidTarget = isSubstitutionValid(substitutionSource, p.id);
        }
      }

      return p ? (
        <div
          key={key}
          className={`transition-all duration-300 ${
            // Visual Styles based on state
            isSubSource
              ? "scale-110 ring-4 border-yellow-400 rounded-full z-20"
              : substitutionSource && !isValidTarget
              ? "opacity-40 grayscale blur-[1px] cursor-not-allowed scale-95"
              : substitutionSource
              ? "cursor-pointer hover:scale-105 animate-pulse"
              : ""
          }`}
        >
          {/* Show Swap Icon if valid target */}
          {substitutionSource && isValidTarget && !isSubSource && (
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-30 bg-yellow-400 text-black p-1 rounded-full shadow-md animate-bounce">
              <ArrowLeftRight size={12} />
            </div>
          )}

          <PlayerShirt
            player={p}
            onClick={() => isValidTarget && handlePlayerClick(p)}
            inPitch={true}
            fixtures={fixtures}
          />
        </div>
      ) : (
        <Placeholder
          key={key}
          position={labelMap[rowObj.type]}
          onClick={() => onPlaceholderClick(rowObj.type)}
          // Disable placeholders during substitution
          disabled={!!substitutionSource}
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
            {/* GK */}
            <div className="flex justify-center pt-1 sm:pt-2 gap-8">
              {renderRow(pitchRows[0], 0)}
            </div>

            {/* DEF */}
            <div className="flex justify-center items-center gap-2 sm:gap-6">
              {renderRow(pitchRows[1], 1)}
            </div>

            {/* MID */}
            <div className="flex justify-center items-center gap-2 sm:gap-6">
              {renderRow(pitchRows[2], 2)}
            </div>

            {/* FWD */}
            <div className="flex justify-center items-end gap-6 sm:gap-8 pb-2 sm:pb-4">
              {renderRow(pitchRows[3], 3)}
            </div>
          </div>
        </div>

        {/* BENCH AREA */}
        {saved && benchPlayers.length > 0 && (
          <div
            className={`mt-4 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-200 dark:border-gray-700 transition-colors ${
              substitutionSource
                ? "border-2 border-yellow-400 bg-yellow-50 dark:bg-gray-800"
                : ""
            }`}
          >
            <div className="text-[10px] font-bold text-center text-gray-400 uppercase tracking-widest mb-2">
              Substitutes
            </div>
            <div className="flex justify-center gap-2 sm:gap-4">
              {benchPlayers.map((p, i) => {
                let label = "SUB";
                if (p) label = labelMap[p.element_type];
                else if (i === 0) label = "GKP";

                // --- BENCH LOGIC VISUALS ---
                const isSubSource = substitutionSource === p?.id;
                let isValidTarget = true;
                if (substitutionSource) {
                  if (!p) isValidTarget = false;
                  else if (p.id === substitutionSource) isValidTarget = true;
                  else
                    isValidTarget = isSubstitutionValid(
                      substitutionSource,
                      p.id
                    );
                }

                return (
                  <div
                    key={p ? p.id : `bench-${i}`}
                    className="flex flex-col items-center"
                  >
                    <div className="text-[8px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                      {label}
                    </div>
                    {p ? (
                      <div
                        className={`transition-all duration-300 ${
                          isSubSource
                            ? "scale-110 border-4 border-yellow-400 rounded-full z-20"
                            : substitutionSource && !isValidTarget
                            ? "opacity-40 grayscale blur-[1px] cursor-not-allowed scale-95"
                            : substitutionSource
                            ? "cursor-pointer hover:scale-105 animate-pulse"
                            : ""
                        }`}
                      >
                        {/* Swap Icon for Bench too */}
                        {substitutionSource &&
                          isValidTarget &&
                          !isSubSource && (
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-30 bg-yellow-400 text-black p-1 rounded-full shadow-md animate-bounce">
                              <ArrowLeftRight size={12} />
                            </div>
                          )}
                        <PlayerShirt
                          player={p}
                          onClick={() => isValidTarget && handlePlayerClick(p)}
                          inPitch={false}
                          fixtures={fixtures}
                        />
                      </div>
                    ) : (
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
    </>
  );
}
