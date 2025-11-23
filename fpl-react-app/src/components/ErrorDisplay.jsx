export default function ErrorDisplay({ message, retry }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-screen">
      <div className="text-red-500 text-xl mb-4">
        ⚠️ {message || "Something went wrong"}
      </div>
      {retry && (
        <button
          onClick={retry}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
