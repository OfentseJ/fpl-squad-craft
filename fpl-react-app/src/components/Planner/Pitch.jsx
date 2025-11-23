import PlayerShirt from "./PlayerShirt";

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

      {/* Pitch Lines (SVG) */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 75"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0"
      >
        <defs>
          <pattern
            id="netPattern"
            x="0"
            y="0"
            width="2"
            height="2"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 0 2 L 2 0 M -1 1 L 1 -1 M 1 3 L 3 1"
              stroke="white"
              strokeWidth="0.5"
              opacity="0.5"
            />
          </pattern>
        </defs>

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

        <g transform="translate(0, -3)">
          <rect
            x="44"
            y="2"
            width="12"
            height="3"
            fill="url(#netPattern)"
            opacity="0.6"
          />
          <rect
            x="44"
            y="2"
            width="12"
            height="3"
            fill="none"
            stroke="white"
            strokeWidth="1"
          />
        </g>
      </svg>
    </div>
  );
}

export default function Pitch({ squad, formation, onRemovePlayer }) {
  const starting11 = squad.filter((p) => p.starting);
  const bench = squad.filter((p) => !p.starting);

  const gkp = starting11.filter((p) => p.element_type === 1)[0];
  const def = starting11
    .filter((p) => p.element_type === 2)
    .slice(0, formation.def);
  const mid = starting11
    .filter((p) => p.element_type === 3)
    .slice(0, formation.mid);
  const fwd = starting11
    .filter((p) => p.element_type === 4)
    .slice(0, formation.fwd);

  return (
    <div className="w-full mx-auto">
      {/* Pitch Container - Mobile Friendly */}
      <div className="relative w-full aspect-4/3 rounded-lg sm:rounded-xl overflow-hidden shadow-2xl border-2 sm:border-4 border-gray-100 bg-[#00b159]">
        <HalfPitchBackground />

        {/* Players Layout - Responsive Spacing */}
        <div className="relative h-full flex flex-col justify-between py-3 sm:py-4 md:py-6 z-10 px-2 sm:px-4">
          {/* Goalkeeper */}
          <div className="flex justify-center pt-1 sm:pt-2">
            {gkp ? (
              <PlayerShirt
                player={gkp}
                onClick={() => onRemovePlayer(gkp.id)}
                inPitch
              />
            ) : (
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 border-2 border-white/50 border-dashed rounded flex items-center justify-center text-white/50 text-[10px] sm:text-xs font-bold">
                GK
              </div>
            )}
          </div>

          {/* Defenders */}
          <div className="flex justify-center items-center gap-2 sm:gap-3 md:gap-6 lg:gap-10 -mt-1 sm:-mt-2">
            {def.map((p) => (
              <PlayerShirt
                key={p.id}
                player={p}
                onClick={() => onRemovePlayer(p.id)}
                inPitch
              />
            ))}
          </div>

          {/* Midfielders */}
          <div className="flex justify-center items-center gap-2 sm:gap-3 md:gap-6 lg:gap-10">
            {mid.map((p) => (
              <PlayerShirt
                key={p.id}
                player={p}
                onClick={() => onRemovePlayer(p.id)}
                inPitch
              />
            ))}
          </div>

          {/* Forwards */}
          <div className="flex justify-center items-end gap-4 sm:gap-6 md:gap-8 lg:gap-10 pb-1 sm:pb-2">
            {fwd.map((p) => (
              <PlayerShirt
                key={p.id}
                player={p}
                onClick={() => onRemovePlayer(p.id)}
                inPitch
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bench - Mobile Optimized */}
      <div className="mt-4 sm:mt-6 bg-gray-100 dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-inner border border-gray-200 dark:border-gray-700">
        <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-center text-gray-500 mb-2 sm:mb-3">
          Substitutes
        </h3>
        <div className="flex justify-center gap-2 sm:gap-3 md:gap-4">
          {bench.slice(0, 4).map((p) => (
            <PlayerShirt
              key={p.id}
              player={p}
              onClick={() => onRemovePlayer(p.id)}
              inPitch={false}
            />
          ))}
          {[...Array(4 - bench.length)].map((_, i) => (
            <div
              key={`empty-${i}`}
              className="w-12 h-16 sm:w-14 sm:h-18 md:w-16 md:h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center text-gray-400 text-[9px] sm:text-[10px]"
            >
              Empty
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
