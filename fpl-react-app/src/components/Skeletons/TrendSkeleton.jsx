export default function TrendSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col h-full overflow-hidden">
      {/* Header Skeleton */}
      <div className="p-5 flex items-center gap-3 border-b border-gray-100 dark:border-gray-700">
        <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>

      {/* List Skeleton (5 Rows) */}
      <div className="flex-1 p-3 space-y-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-2 pr-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl"
          >
            {/* Rank */}
            <div className="w-5 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse shrink-0" />

            {/* Star Icon */}
            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse shrink-0" />

            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse shrink-0" />

            {/* Text Info */}
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>

            {/* Metric */}
            <div className="flex flex-col items-end space-y-1">
              <div className="h-5 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-3 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
