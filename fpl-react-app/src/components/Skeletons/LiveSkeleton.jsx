export default function LiveSkeleton() {
  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-8 min-h-screen animate-pulse">
      {/* HEADER SKELETON */}
      <div>
        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2"></div>
        <div className="h-4 w-48 bg-gray-100 dark:bg-gray-800 rounded-lg ml-7"></div>
      </div>

      {/* WIDGETS GRID SKELETON */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* MVP Card */}
        <div className="bg-gray-100 dark:bg-gray-800 p-5 rounded-2xl h-48 border border-gray-200 dark:border-gray-700 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
            <div className="w-16 h-3 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="flex items-end gap-4 mt-8">
            <div className="w-20 h-24 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
            <div className="space-y-2 pb-1">
              <div className="w-24 h-6 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="w-12 h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>

        {/* Template Watch & Differentials (Identical structure) */}
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-gray-100 dark:bg-gray-800 p-5 rounded-2xl h-48 border border-gray-200 dark:border-gray-700 flex flex-col"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="w-24 h-3 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="space-y-4 flex-1">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                    <div className="space-y-1">
                      <div className="w-20 h-3 bg-gray-300 dark:bg-gray-700 rounded"></div>
                      <div className="w-12 h-2 bg-gray-200 dark:bg-gray-800 rounded"></div>
                    </div>
                  </div>
                  <div className="w-8 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* MAIN LIST HEADER */}
      <div className="flex justify-between items-end border-b border-gray-200 dark:border-gray-700 pb-2">
        <div className="h-6 w-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
        <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded"></div>
      </div>

      {/* MAIN PLAYER LIST SKELETON */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4"
          >
            {/* Left: Avatar & Name */}
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>
              <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0"></div>
              <div className="space-y-2">
                <div className="w-32 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="w-20 h-3 bg-gray-200 dark:bg-gray-800 rounded"></div>
              </div>
            </div>

            {/* Right: Stats Grid */}
            <div className="grid grid-cols-4 gap-6 w-full sm:w-auto">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="flex flex-col items-center gap-1">
                  <div className="w-8 h-6 bg-gray-300 dark:bg-gray-700 rounded"></div>
                  <div className="w-6 h-2 bg-gray-200 dark:bg-gray-800 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
