import { useContext } from "react";
import { Sun, Moon } from "lucide-react";
import { DarkModeContext } from "../context/DarkModeContext";

export default function DarkModeToggle() {
  const { dark, setDark } = useContext(DarkModeContext);
  return (
    <button
      className="fixed bottom-6 right-6 bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-all z-50"
      onClick={() => setDark(!dark)}
      aria-label="Toggle dark mode"
    >
      {dark ? <Sun size={24} /> : <Moon size={24} />}
    </button>
  );
}
