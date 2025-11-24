import { Plus } from "lucide-react";
import PlayerShirt from "./PlayerShirt";

// Reusable Half Pitch SVG Background (Unchanged logic, just keeping context)
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

// UPDATED: Placeholder Component to match new Shirt Sizes
function Placeholder({ position, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-105 z-10"
    >
      {/* Circle matches the Shirt Image Size roughly */}
      <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full bg-green-800/40 border-2 border-white/30 flex items-center justify-center backdrop-blur-sm group-hover:bg-green-700/60 group-hover:border-white/80 transition-all shadow-lg">
        <Plus className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white/70 group-hover:text-white" />
      </div>
      {/* Label matches the Info Box width roughly */}
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
}) {
  const goalkeepers = squad.filter((p) => p.element_type === 1);
  const defenders = squad.filter((p) => p.element_type === 2);
  const midfielders = squad.filter((p) => p.element_type === 3);
  const forwards = squad.filter((p) => p.element_type === 4);

  const startGK = [goalkeepers[0] || null];
  const startDEF = Array(formation.def)
    .fill(null)
    .map((_, i) => defenders[i] || null);
  const startMID = Array(formation.mid)
    .fill(null)
    .map((_, i) => midfielders[i] || null);
  const startFWD = Array(formation.fwd)
    .fill(null)
    .map((_, i) => forwards[i] || null);

  const benchGK = goalkeepers.slice(1);
  const benchDEF = defenders.slice(formation.def);
  const benchMID = midfielders.slice(formation.mid);
  const benchFWD = forwards.slice(formation.fwd);

  const fullBench = [...benchGK, ...benchDEF, ...benchMID, ...benchFWD];
  const benchSlots = Array(4)
    .fill(null)
    .map((_, i) => fullBench[i] || null);

  return (
    <div className="w-full mx-auto max-w-md sm:max-w-xl md:max-w-3xl">
      {/* --- PITCH AREA --- */}
      <div className="relative w-full aspect-3/4 sm:aspect-4/3 rounded-xl overflow-hidden shadow-2xl border-4 border-white bg-[#00b159]">
        <HalfPitchBackground />

        {/* Layout Container with Padding to prevent edge clipping */}
        <div className="relative h-full flex flex-col justify-between py-4 sm:py-6 z-10 px-1 sm:px-4">
          {/* GOALKEEPER ROW */}
          <div className="flex justify-center pt-1 sm:pt-2">
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

          {/* DEFENDERS ROW - Added GAP to prevent overlap */}
          <div className="flex justify-center items-center gap-1 sm:gap-4 md:gap-6 lg:gap-10">
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

          {/* MIDFIELDERS ROW - Added GAP */}
          <div className="flex justify-center items-center gap-1 sm:gap-4 md:gap-6 lg:gap-10">
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

          {/* FORWARDS ROW - Added GAP */}
          <div className="flex justify-center items-end gap-2 sm:gap-6 md:gap-8 lg:gap-12 pb-2 sm:pb-4">
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
        <div className="flex justify-center gap-2 sm:gap-4">
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
                className="w-12 h-16 sm:w-14 sm:h-18 md:w-16 md:h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center"
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
