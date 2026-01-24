export default function HomeSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 animate-pulse">
      {/* HERO SECTION SKELETON */}
      <div className="bg-gray-200 dark:bg-gray-800 py-16 sm:py-24 px-6 relative overflow-hidden h-100 flex flex-col items-center justify-center">
        {/* Title Lines */}
        <div className="h-10 sm:h-12 w-3/4 sm:w-1/2 bg-gray-300 dark:bg-gray-700 rounded-lg mb-6"></div>
        {/* Description Lines */}
        <div className="h-4 sm:h-5 w-full sm:w-2/3 max-w-2xl bg-gray-300 dark:bg-gray-700 rounded mb-3"></div>
        <div className="h-4 sm:h-5 w-3/4 sm:w-1/2 max-w-xl bg-gray-300 dark:bg-gray-700 rounded mb-8"></div>
        {/* Button */}
        <div className="h-12 w-48 rounded-full bg-gray-300 dark:bg-gray-700"></div>
      </div>

      {/* MAIN CONTENT SKELETON */}
      <div className="grow max-w-6xl mx-auto px-4 sm:px-6 w-full -mt-10 relative z-20 pb-12">
        {/* STATUS BANNER SKELETON */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-1 mb-10 border border-gray-100 dark:border-gray-700">
          <div className="bg-gray-100 dark:bg-gray-900 p-6 rounded-xl flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Left: Icon & Text */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-12 h-12 rounded-lg bg-gray-300 dark:bg-gray-700 shrink-0"></div>
              <div className="space-y-2">
                <div className="h-3 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="h-6 w-40 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>
            </div>

            {/* Right: Countdown Timer Simulation */}
            <div className="flex items-center gap-2 sm:gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gray-300 dark:bg-gray-700"></div>
                  <div className="w-4 h-2 bg-gray-200 dark:bg-gray-800 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FEATURE GRID SKELETON */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-64 flex flex-col"
            >
              {/* Icon Box */}
              <div className="w-14 h-14 rounded-xl bg-gray-200 dark:bg-gray-700 mb-4"></div>
              {/* Title */}
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
              {/* Description */}
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-100 dark:bg-gray-700/50 rounded"></div>
                <div className="h-4 w-5/6 bg-gray-100 dark:bg-gray-700/50 rounded"></div>
                <div className="h-4 w-4/6 bg-gray-100 dark:bg-gray-700/50 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
