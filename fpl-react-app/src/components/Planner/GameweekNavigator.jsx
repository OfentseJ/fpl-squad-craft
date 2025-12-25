import { ChevronLeft, ChevronRight, Calendar, AlertCircle } from "lucide-react";

export default function GameweekNavigator({
  viewingGw,
  currentActualGw,
  setViewingGw,
  setFreeTransfers,
}) {
  // Constraint: Max 3 weeks ahead
  const maxFutureGw = currentActualGw + 3;

  const handlePrev = () => {
    if (viewingGw > currentActualGw) {
      setViewingGw(viewingGw - 1);
      setFreeTransfers((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (viewingGw < maxFutureGw) {
      setViewingGw(viewingGw + 1);
      setFreeTransfers((prev) => prev + 1);
    }
  };

  const isPrevDisabled = viewingGw <= currentActualGw;
  const isNextDisabled = viewingGw >= maxFutureGw;
  const isFuture = viewingGw > currentActualGw;

  return (
    <div className="w-full flex justify-center">
      <div className="flex items-center justify-between w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-2 sm:p-3 transition-colors duration-300">
        {/* Previous Button */}
        <button
          onClick={handlePrev}
          disabled={isPrevDisabled}
          className={`
            p-2 rounded-lg transition-all duration-200 flex items-center justify-center
            ${
              isPrevDisabled
                ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-green-600 dark:hover:text-green-400 cursor-pointer"
            }
          `}
          aria-label="Previous Gameweek"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Center Info */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <Calendar
              size={18}
              className={isFuture ? "text-amber-500" : "text-green-600"}
            />
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
              Gameweek {viewingGw}
            </h2>
          </div>

          {/* Status Badge */}
          <div
            className={`
            mt-1 px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1
            ${
              isFuture
                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 border border-amber-200 dark:border-amber-800"
                : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 border border-green-200 dark:border-green-800"
            }
          `}
          >
            {isFuture ? (
              <>
                <AlertCircle size={10} /> Planning Mode
              </>
            ) : (
              "Active Squad"
            )}
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={isNextDisabled}
          className={`
            p-2 rounded-lg transition-all duration-200 flex items-center justify-center
            ${
              isNextDisabled
                ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-green-600 dark:hover:text-green-400 cursor-pointer"
            }
          `}
          aria-label="Next Gameweek"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}
