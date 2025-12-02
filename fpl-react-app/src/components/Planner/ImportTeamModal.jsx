import { useState } from "react";
import { X } from "lucide-react";

export default function ImportTeamModal({ isOpen, onClose, onImport, data }) {
  const [teamId, setTeamId] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");

  const handleImport = async () => {
    if (!teamId.trim()) {
      setImportError("Please enter a Team ID");
      return;
    }

    setImporting(true);
    setImportError("");

    try {
      await onImport(teamId.trim());
      setTeamId("");
      onClose();
    } catch (error) {
      setImportError(
        error.message ||
          "Failed to import team. Please check your Team ID and try again."
      );
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setTeamId("");
    setImportError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            Import FPL Team
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Enter your FPL Team ID to import your current squad. You can find
              this in your FPL URL:
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-3 bg-gray-100 dark:bg-gray-700 p-2 rounded">
              fantasy.premierleague.com/entry/
              <span className="font-bold text-blue-600">YOUR_ID</span>/event/1
            </p>
          </div>

          <input
            type="text"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleImport()}
            placeholder="Enter Team ID (e.g., 123456)"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            disabled={importing}
            autoFocus
          />

          {importError && <p className="text-sm text-red-500">{importError}</p>}

          <button
            onClick={handleImport}
            disabled={importing}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importing ? "Importing..." : "Import Team"}
          </button>
        </div>
      </div>
    </div>
  );
}
