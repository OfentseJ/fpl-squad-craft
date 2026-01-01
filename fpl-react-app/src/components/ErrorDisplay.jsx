import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function ErrorDisplay({ message, retry }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 font-sans">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Error Header / Icon */}
        <div className="flex flex-col items-center p-8 text-center">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-6 ring-8 ring-red-50/50 dark:ring-red-900/10">
            <AlertTriangle size={32} strokeWidth={2.5} />
          </div>

          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
            Unable to Load
          </h2>

          <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
            {message ||
              "We encountered an unexpected issue while retrieving your FPL data."}
          </p>

          {/* Action Area */}
          <div className="flex flex-col w-full gap-3">
            {retry && (
              <button
                onClick={retry}
                className="group w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                <RefreshCw
                  size={20}
                  className="group-hover:rotate-180 transition-transform duration-500"
                />
                Try Again
              </button>
            )}

            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium py-3 px-6 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>

        {/* Footer Stripe */}
        <div className="h-1.5 w-full bg-linear-to-r from-red-400 via-orange-400 to-red-400 opacity-80"></div>
      </div>
    </div>
  );
}
