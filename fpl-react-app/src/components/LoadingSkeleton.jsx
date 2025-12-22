export default function LoadingSkeleton() {
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full font-sans">
      {/* 1. Header / Banner Skeleton */}
      <div className="w-full h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse mb-6"></div>

      {/* 2. Dashboard / Nav Bar Skeleton */}
      <div className="w-full h-20 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse mb-8 border border-gray-100 dark:border-gray-700"></div>

      {/* 3. Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* LEFT COL: PITCH SKELETON (Span 8) */}
        <div className="lg:col-span-8 order-1">
          <div className="relative w-full aspect-3/4 sm:aspect-4/3 rounded-xl overflow-hidden shadow-lg border-4 border-white dark:border-gray-700 bg-green-50 dark:bg-green-900/20 animate-pulse">
            {/* Simulate Player Nodes on Pitch */}
            <div className="absolute inset-0 flex flex-col justify-around py-8 px-4">
              {/* Row 1 (GK) */}
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full bg-green-200 dark:bg-green-800/40"></div>
              </div>
              {/* Row 2 (DEF) */}
              <div className="flex justify-center gap-8">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-full bg-green-200 dark:bg-green-800/40"
                  ></div>
                ))}
              </div>
              {/* Row 3 (MID) */}
              <div className="flex justify-center gap-8">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-full bg-green-200 dark:bg-green-800/40"
                  ></div>
                ))}
              </div>
              {/* Row 4 (FWD) */}
              <div className="flex justify-center gap-8">
                {[...Array(2)].map((_, i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-full bg-green-200 dark:bg-green-800/40"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COL: PLAYER LIST SKELETON (Span 4) */}
        <div className="lg:col-span-4 order-2 space-y-3">
          {/* Simulate Filter Bar */}
          <div className="h-12 w-full bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse mb-4"></div>

          {/* Simulate Player Rows */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 animate-pulse"
            >
              {/* Shirt Circle */}
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0"></div>

              {/* Name Bars */}
              <div className="grow space-y-1.5">
                <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-2 w-1/3 bg-gray-100 dark:bg-gray-700/50 rounded"></div>
              </div>

              {/* Points Box */}
              <div className="w-8 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
