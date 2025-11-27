import { TrendingUp, Activity, Star } from "lucide-react";
import { getCurrentGameweek } from "../utils/gameweek";
import Footer from "../components/Footer";

export default function Home({ data }) {
  const currentGW = getCurrentGameweek(data?.events);

  return (
    <>
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h2 className="text-4xl font-bold mb-4">
          Fantasy Premier League Tools
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          View FPL statistics, live match contributions, explore transfer
          trends, and plan your team using real-time Fantasy Premier League
          data.
        </p>

        {currentGW && (
          <div className="bg-green-600 text-white p-6 rounded-xl shadow-lg">
            <h3 className="text-2xl font-semibold mb-2">
              Gameweek {currentGW.id}
            </h3>
            <p className="text-green-100">
              {currentGW.is_current
                ? "In Progress"
                : `Starts: ${new Date(
                    currentGW.deadline_time
                  ).toLocaleDateString()}`}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-shadow">
            <TrendingUp className="mx-auto mb-3 text-green-600" size={40} />
            <h4 className="font-semibold text-lg mb-2">Transfer Trends</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              See who's hot and who's not
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-shadow">
            <Activity className="mx-auto mb-3 text-green-600" size={40} />
            <h4 className="font-semibold text-lg mb-2">Live Stats</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Real-time BPS and performance
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-shadow">
            <Star className="mx-auto mb-3 text-green-600" size={40} />
            <h4 className="font-semibold text-lg mb-2">Squad Planner</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Build your perfect team
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
