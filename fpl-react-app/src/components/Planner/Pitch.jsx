import { Plus } from "lucide-react";
import PlayerShirt from "./PlayerShirt";
import { useFPLApi } from "../../hooks/useFPLApi";
import { useEffect, useState } from "react";
import PlayerDetailModal from "./PlayerDetailModal";

function HalfPitchBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none bg-[#00b159]">
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(0,0,0,0.05) 40px, rgba(0,0,0,0.05) 80px)",
        }}
      />
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

function Placeholder({ position, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-105 z-10"
    >
      <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full bg-green-800/40 border-2 border-white/30 flex items-center justify-center backdrop-blur-sm group-hover:bg-green-700/60 group-hover:border-white/80 transition-all shadow-lg">
        <Plus className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white/70 group-hover:text-white" />
      </div>
      <div className="mt-1 px-2 py-0.5 bg-green-900/80 rounded text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-wider shadow-sm min-w-[50px] text-center">
        {position}
      </div>
    </button>
  );
}

export default function Pitch({
  squad,
  formation,
  onRemovePlayer,
  onPlaceholderClick,
  onSubstitutePlayers,
}) {
  const [fixtures, setFixtures] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const { getFixtures } = useFPLApi();

  useEffect(() => {
    getFixtures().then((data) => setFixtures(data));
  }, []);

  const handlePlayerClick = (player) => {
    setSelectedPlayer(player);
  };

  const handleSubstitute = (player1Id, player2Id) => {
    if (onSubstitutePlayers) onSubstitutePlayers(player1Id, player2Id);
    setSelectedPlayer(null);
  };

  const labelMap = { 1: "GKP", 2: "DEF", 3: "MID", 4: "FWD" };

  // 1. Sort squad by type
  const allGKP = squad.filter((p) => p.element_type === 1);
  const allDEF = squad.filter((p) => p.element_type === 2);
  const allMID = squad.filter((p) => p.element_type === 3);
  const allFWD = squad.filter((p) => p.element_type === 4);

  // 2. Determine STARTING XI
  // We take the first X players of each type based on formation count
  const startGK = [allGKP[0] || null];
  const startDEF = Array(formation.def)
    .fill(null)
    .map((_, i) => allDEF[i] || null);
  const startMID = Array(formation.mid)
    .fill(null)
    .map((_, i) => allMID[i] || null);
  const startFWD = Array(formation.fwd)
    .fill(null)
    .map((_, i) => allFWD[i] || null);

  // 3. Determine BENCH
  // The bench is strictly defined: Slot 0 is GKP, Slots 1-3 are Outfield

  // Reserve GK: The 2nd goalkeeper in the list (if exists)
  const reserveGK = allGKP[1] || null;

  const reserveOutfield = [
    ...allDEF.slice(formation.def),
    ...allMID.slice(formation.mid),
    ...allFWD.slice(formation.fwd),
  ];

  const benchSlots = [
    reserveGK,
    reserveOutfield[0] || null,
    reserveOutfield[1] || null,
    reserveOutfield[2] || null,
  ];

  return (
    <>
      <div className="w-full mx-auto max-w-md sm:max-w-xl md:max-w-3xl">
        {/* PITCH AREA */}
        <div className="relative w-full aspect-3/4 sm:aspect-4/3 rounded-xl overflow-hidden shadow-2xl border-4 border-white bg-[#00b159]">
          <HalfPitchBackground />

          <div className="relative h-full flex flex-col justify-between py-4 sm:py-6 z-10 px-1 sm:px-4">
            {/* GOALKEEPER */}
            <div className="flex justify-center pt-1 sm:pt-2">
              {startGK.map((p, i) =>
                p ? (
                  <PlayerShirt
                    key={p.id}
                    player={p}
                    onClick={() => handlePlayerClick(p)}
                    inPitch
                    fixtures={fixtures}
                  />
                ) : (
                  <Placeholder
                    key={`gk-${i}`}
                    position="GKP"
                    onClick={() => onPlaceholderClick(1)}
                  />
                )
              )}
            </div>

            {/* DEFENDERS */}
            <div className="flex justify-center items-center gap-1 sm:gap-4 md:gap-6 lg:gap-10">
              {startDEF.map((p, i) =>
                p ? (
                  <PlayerShirt
                    key={p.id}
                    player={p}
                    onClick={() => handlePlayerClick(p)}
                    inPitch
                    fixtures={fixtures}
                  />
                ) : (
                  <Placeholder
                    key={`def-${i}`}
                    position="DEF"
                    onClick={() => onPlaceholderClick(2)}
                  />
                )
              )}
            </div>

            {/* MIDFIELDERS */}
            <div className="flex justify-center items-center gap-1 sm:gap-4 md:gap-6 lg:gap-10">
              {startMID.map((p, i) =>
                p ? (
                  <PlayerShirt
                    key={p.id}
                    player={p}
                    onClick={() => handlePlayerClick(p)}
                    inPitch
                    fixtures={fixtures}
                  />
                ) : (
                  <Placeholder
                    key={`mid-${i}`}
                    position="MID"
                    onClick={() => onPlaceholderClick(3)}
                  />
                )
              )}
            </div>

            {/* FORWARDS */}
            <div className="flex justify-center items-end gap-2 sm:gap-6 md:gap-8 lg:gap-12 pb-2 sm:pb-4">
              {startFWD.map((p, i) =>
                p ? (
                  <PlayerShirt
                    key={p.id}
                    player={p}
                    onClick={() => handlePlayerClick(p)}
                    inPitch
                    fixtures={fixtures}
                  />
                ) : (
                  <Placeholder
                    key={`fwd-${i}`}
                    position="FWD"
                    onClick={() => onPlaceholderClick(4)}
                  />
                )
              )}
            </div>
          </div>
        </div>

        {/* BENCH AREA */}
        <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-200 dark:border-gray-700">
          <div className="text-[10px] font-bold text-center text-gray-400 uppercase tracking-widest mb-2">
            Substitutes
          </div>
          <div className="flex justify-center gap-2 sm:gap-4">
            {benchSlots.map((p, i) => {
              // Determine Label
              let label = "";
              if (p) {
                label = labelMap[p.element_type]; // "GKP", "DEF", etc. if player exists
              } else {
                label = i === 0 ? "GKP" : "SUB"; // "GKP" for first slot, "SUB" for others if empty
              }

              return p ? (
                <div key={p.id} className="flex flex-col items-center">
                  <div className="text-[8px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                    {label}
                  </div>
                  <PlayerShirt
                    player={p}
                    onClick={() => handlePlayerClick(p)}
                    inPitch={false}
                    fixtures={fixtures}
                  />
                </div>
              ) : (
                <div
                  key={`bench-empty-${i}`}
                  className="flex flex-col items-center"
                >
                  <div className="text-[8px] font-bold text-gray-300 mb-1">
                    {label}
                  </div>
                  <div className="w-12 h-16 sm:w-14 sm:h-18 md:w-16 md:h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
                    <span className="text-gray-300 text-[10px]">—</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedPlayer && (
        <PlayerDetailModal
          player={selectedPlayer}
          squad={squad}
          fixtures={fixtures}
          onClose={() => setSelectedPlayer(null)}
          onRemove={onRemovePlayer}
          onSubstitute={handleSubstitute}
        />
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slideInRight { animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </>
  );
}
