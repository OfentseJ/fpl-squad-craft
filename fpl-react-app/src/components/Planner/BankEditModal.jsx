import { useState, useEffect } from "react";
import { X, Save, DollarSign } from "lucide-react";

export default function BankEditModal({
  isOpen,
  onClose,
  currentBank,
  onSave,
}) {
  const [value, setValue] = useState("");

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      // Convert stored integer (15) to display float (1.5)
      setValue((currentBank / 10).toFixed(1));
    }
  }, [isOpen, currentBank]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const storedValue = Math.round(parseFloat(value) * 10);
    onSave(storedValue);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-200 dark:border-gray-700 overflow-hidden transform transition-all scale-100">
        {/* Header */}
        <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <DollarSign size={20} className="text-green-600" />
            Edit Budget
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Money In Bank (£m)
          </label>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 font-bold">£</span>
            </div>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="pl-7 pr-4 py-3 w-full text-lg font-bold border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-gray-50 dark:bg-gray-900 dark:text-white transition-all"
              autoFocus
            />
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            Enter the exact amount shown in your FPL account.
            <br />
            Example: Enter <strong>1.5</strong> for £1.5m
          </p>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Save size={18} />
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
