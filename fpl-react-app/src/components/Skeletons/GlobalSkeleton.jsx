export default function GlobalSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 animate-pulse transition-colors duration-300">
      {/* NAVBAR SKELETON */}
      <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 sm:px-6 justify-between shrink-0 sticky top-0 z-50">
        {/* Logo Placeholder */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-300 dark:bg-gray-700"></div>
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded hidden sm:block"></div>
        </div>
        {/* Nav Links Placeholder */}
        <div className="flex gap-4">
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded hidden sm:block"></div>
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded hidden sm:block"></div>
          <div className="w-8 h-8 rounded bg-gray-300 dark:bg-gray-700 sm:hidden"></div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="grow w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-8">
        {/* GENERIC HERO BLOCK */}
        <div className="w-full h-48 sm:h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>

        {/* GENERIC 3-COLUMN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col gap-4"
            >
              {/* Icon / Top part */}
              <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
              {/* Text lines */}
              <div className="space-y-2">
                <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-1/2 bg-gray-100 dark:bg-gray-700/50 rounded"></div>
              </div>
              {/* Bottom block */}
              <div className="mt-auto h-20 w-full bg-gray-100 dark:bg-gray-900 rounded-lg"></div>
            </div>
          ))}
        </div>

        {/* GENERIC LIST / TABLE SECTION */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          {/* Section Header */}
          <div className="flex justify-between items-center">
            <div className="h-6 w-40 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>

          {/* List Items */}
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0"></div>
                <div className="h-4 w-full bg-gray-100 dark:bg-gray-900 rounded"></div>
                <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded shrink-0"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER SKELETON */}
      <div className="h-24 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto flex flex-col justify-center items-center gap-2">
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-3 w-48 bg-gray-100 dark:bg-gray-800 rounded"></div>
      </div>
    </div>
  );
}
