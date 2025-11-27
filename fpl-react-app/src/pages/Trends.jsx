import { useState, useEffect } from "react";
import { Filter } from "lucide-react";
import PlayerCard from "../components/PlayerCard";
import Footer from "../components/Footer";

export default function Trends({ data }) {
  const [sortBy, setSortBy] = useState("transfers_in");
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    if (!data?.elements) return;

    let sorted = [...data.elements];
    if (sortBy === "transfers_in") {
      sorted.sort((a, b) => b.transfers_in_event - a.transfers_in_event);
    } else if (sortBy === "transfers_out") {
      sorted.sort((a, b) => b.transfers_out_event - a.transfers_out_event);
    } else if (sortBy === "form") {
      sorted.sort((a, b) => parseFloat(b.form) - parseFloat(a.form));
    }

    setPlayers(sorted.slice(0, 16));
  }, [data, sortBy]);

  return (
    <>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-3xl font-bold">Transfer Trends</h2>

            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-600 dark:text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
              >
                <option value="transfers_in">Most Transferred In</option>
                <option value="transfers_out">Most Transferred Out</option>
                <option value="form">Best Form</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {players.map((p) => (
              <PlayerCard key={p.id} player={p} teams={data?.teams} />
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
