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

      {/* Pitch Lines (SVG) - ViewBox adjusted for Half Pitch proportions */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 75" // Aspect ratio roughly 4:3
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

        {/* --- Main Lines Group --- */}
        <g fill="none" stroke="white" strokeWidth="1" opacity="0.8">
          {/* Outer Border (Top and Sides) */}
          <path d="M 2 75 L 2 2 L 98 2 L 98 75" strokeWidth="1.5" />

          {/* Bottom Line (The Center Line) */}
          <line x1="0" y1="75" x2="100" y2="75" strokeWidth="2" />

          {/* Center Circle (Semi-circle at bottom) */}
          <path d="M 35 75 A 15 15 0 0 1 65 75" strokeWidth="1.5" />
          <circle cx="50" cy="75" r="1.5" fill="white" />

          {/* --- Penalty Area (Top) --- */}
          {/* 18-yard box */}
          <rect x="22" y="2" width="56" height="18" />
          {/* 6-yard box */}
          <rect x="37" y="2" width="26" height="6" />
          {/* Penalty Spot */}
          <circle cx="50" cy="12" r="0.8" fill="white" />
          {/* Penalty Arc */}
          <path d="M 42 20 Q 50 26 58 20" />

          {/* Corner Arcs (Top only) */}
          <path d="M 2 8 Q 8 8 8 2" />
          <path d="M 92 2 Q 92 8 98 8" />
        </g>

        {/* --- Goal Net (Top) --- */}
        <g transform="translate(0, -3)">
          {/* Net Texture */}
          <rect
            x="44"
            y="2"
            width="12"
            height="3"
            fill="url(#netPattern)"
            opacity="0.6"
          />
          {/* Net Frame */}
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
    <div className="w-full max-w-4xl mx-auto">
      {/* Pitch Container - CHANGED Aspect Ratio to 4/3 (Half Pitch shape) */}
      <div className="relative w-full aspect-4/3 rounded-xl overflow-hidden shadow-2xl border-4 border-gray-100 bg-[#00b159]">
        {/* SVG Background */}
        <HalfPitchBackground />

        {/* Players Layout Layer */}
        {/* Adjusted Spacing for Half Pitch */}
        <div className="relative h-full flex flex-col justify-between py-6 z-10 px-4">
          {/* Goalkeeper (Top - Goal Box) */}
          <div className="flex justify-center pt-2">
            {gkp ? (
              <PlayerShirt
                player={gkp}
                onClick={() => onRemovePlayer(gkp.id)}
                inPitch
              />
            ) : (
              <div className="w-16 h-16 border-2 border-white/50 border-dashed rounded flex items-center justify-center text-white/50 text-xs font-bold">
                GK
              </div>
            )}
          </div>

          {/* Defenders (Penalty Area Edge) */}
          <div className="flex justify-center items-center gap-4 md:gap-10 -mt-2">
            {def.map((p) => (
              <PlayerShirt
                key={p.id}
                player={p}
                onClick={() => onRemovePlayer(p.id)}
                inPitch
              />
            ))}
          </div>

          {/* Midfielders (Middle of Half) */}
          <div className="flex justify-center items-center gap-4 md:gap-10">
            {mid.map((p) => (
              <PlayerShirt
                key={p.id}
                player={p}
                onClick={() => onRemovePlayer(p.id)}
                inPitch
              />
            ))}
          </div>

          {/* Forwards (Bottom - Center Circle) */}
          <div className="flex justify-center items-end gap-10 pb-2">
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

      {/* Bench Area (Unchanged) */}
      <div className="mt-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-4 shadow-inner border border-gray-200 dark:border-gray-700">
        <h3 className="text-xs font-bold uppercase tracking-wider text-center text-gray-500 mb-3">
          Substitutes
        </h3>
        <div className="flex justify-center gap-4">
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
              className="w-16 h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center text-gray-400 text-[10px]"
            >
              Empty
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
