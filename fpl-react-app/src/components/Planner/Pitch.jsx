import { Plus } from "lucide-react";
import PlayerShirt from "./PlayerShirt"; // Assuming this is in the same folder

// Reusable Half Pitch SVG Background
function HalfPitchBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none bg-[#00b159]">
      {/* Striped Grass Pattern */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(0,0,0,0.05) 40px, rgba(0,0,0,0.05) 80px)",
        }}
      />
      {/* SVG Lines */}
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

// The Placeholder Component (The "+" Button)
function Placeholder({ position, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-105"
    >
      <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-green-800/40 border-2 border-white/30 flex items-center justify-center backdrop-blur-sm group-hover:bg-green-700/60 group-hover:border-white/80 transition-all shadow-lg">
        <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-white/70 group-hover:text-white" />
      </div>
      <div className="mt-1 px-2 py-0.5 bg-green-900/80 rounded text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-wider">
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
}) {
  // 1. Separate Squad into positions
  const goalkeepers = squad.filter((p) => p.element_type === 1);
  const defenders = squad.filter((p) => p.element_type === 2);
  const midfielders = squad.filter((p) => p.element_type === 3);
  const forwards = squad.filter((p) => p.element_type === 4);

  // 2. Identify Starting XI vs Bench based on the formation limits
  // Note: We fill starting spots first. Any overflow goes to bench.

  // GK: 1 Starting
  const startGK = [goalkeepers[0] || null];

  // DEF: Dynamic based on formation
  const startDEF = Array(formation.def)
    .fill(null)
    .map((_, i) => defenders[i] || null);

  // MID: Dynamic based on formation
  const startMID = Array(formation.mid)
    .fill(null)
    .map((_, i) => midfielders[i] || null);

  // FWD: Dynamic based on formation
  const startFWD = Array(formation.fwd)
    .fill(null)
    .map((_, i) => forwards[i] || null);

  // 3. Calculate Bench (Remaining players not in starting arrays)
  // Logic: Get all players of type X, slice off the ones used in starting XI
  const benchGK = goalkeepers.slice(1);
  const benchDEF = defenders.slice(formation.def);
  const benchMID = midfielders.slice(formation.mid);
  const benchFWD = forwards.slice(formation.fwd);

  // Flatten bench and pad to 4 slots
  const fullBench = [...benchGK, ...benchDEF, ...benchMID, ...benchFWD];
  const benchSlots = Array(4)
    .fill(null)
    .map((_, i) => fullBench[i] || null);

  return (
    <div className="w-full mx-auto max-w-md sm:max-w-lg md:max-w-2xl">
      {/* --- PITCH AREA --- */}
      <div className="relative w-full aspect-3/4 sm:aspect-4/3 rounded-xl overflow-hidden shadow-2xl border-4 border-white bg-[#00b159]">
        <HalfPitchBackground />

        {/* Layout Container */}
        <div className="relative h-full flex flex-col justify-between py-4 sm:py-6 z-10 px-2">
          {/* GOALKEEPER ROW */}
          <div className="flex justify-center pt-2">
            {startGK.map((p, i) =>
              p ? (
                <PlayerShirt
                  key={p.id}
                  player={p}
                  onClick={() => onRemovePlayer(p.id)}
                  inPitch
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

          {/* DEFENDERS ROW */}
          <div className="flex justify-center items-center gap-2 sm:gap-4 md:gap-8">
            {startDEF.map((p, i) =>
              p ? (
                <PlayerShirt
                  key={p.id}
                  player={p}
                  onClick={() => onRemovePlayer(p.id)}
                  inPitch
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

          {/* MIDFIELDERS ROW */}
          <div className="flex justify-center items-center gap-2 sm:gap-4 md:gap-8">
            {startMID.map((p, i) =>
              p ? (
                <PlayerShirt
                  key={p.id}
                  player={p}
                  onClick={() => onRemovePlayer(p.id)}
                  inPitch
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

          {/* FORWARDS ROW */}
          <div className="flex justify-center items-end gap-6 sm:gap-8 md:gap-12 pb-2 sm:pb-4">
            {startFWD.map((p, i) =>
              p ? (
                <PlayerShirt
                  key={p.id}
                  player={p}
                  onClick={() => onRemovePlayer(p.id)}
                  inPitch
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

      {/* --- BENCH AREA --- */}
      <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-200 dark:border-gray-700">
        <div className="text-[10px] font-bold text-center text-gray-400 uppercase tracking-widest mb-2">
          Substitutes
        </div>
        <div className="flex justify-center gap-3 sm:gap-4">
          {benchSlots.map((p, i) =>
            p ? (
              <PlayerShirt
                key={p.id}
                player={p}
                onClick={() => onRemovePlayer(p.id)}
                inPitch={false}
              />
            ) : (
              <div
                key={`bench-empty-${i}`}
                className="w-12 h-16 sm:w-14 sm:h-18 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center"
              >
                <span className="text-gray-300 text-[10px]">Sub</span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
