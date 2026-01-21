import { Routes, Route, HashRouter } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import LoadingSkeleton from "./components/Skeletons/LoadingSkeleton";
import TrendSkeleton from "./components/Skeletons/TrendSkeleton";
import ErrorDisplay from "./components/ErrorDisplay";
import Home from "./pages/Home";
import Trends from "./pages/Trends";
import Live from "./pages/Live";
import Planner from "./pages/Planner";
import { useFPLApi } from "./hooks/useFPLApi";

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { getBootstrap } = useFPLApi();

  useEffect(() => {
    getBootstrap()
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [getBootstrap]);

  // If there is a critical error, we still block the UI
  if (error) {
    return (
      <ErrorDisplay message={error} retry={() => window.location.reload()} />
    );
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-200 transition-colors flex flex-col">
        {/* Navbar loads immediately (App Shell Pattern) */}
        <Navbar />

        <div className="flex-1">
          <Routes>
            {/* HOME: Uses generic skeleton while loading
             */}
            <Route
              path="/"
              element={loading ? <LoadingSkeleton /> : <Home data={data} />}
            />

            {/* TRENDS: Uses the NEW specific TrendSkeleton while loading
             */}
            <Route
              path="/trends"
              element={
                loading ? (
                  <div className="p-8 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      <TrendSkeleton />
                      <TrendSkeleton />
                      <TrendSkeleton />
                      <TrendSkeleton />
                      <TrendSkeleton />
                      <TrendSkeleton />
                    </div>
                  </div>
                ) : (
                  <Trends data={data} />
                )
              }
            />

            {/* OTHERS: Use generic skeleton for now
             */}
            <Route
              path="/live"
              element={loading ? <LoadingSkeleton /> : <Live data={data} />}
            />
            <Route
              path="/planner"
              element={loading ? <LoadingSkeleton /> : <Planner data={data} />}
            />
          </Routes>
        </div>
      </div>
    </HashRouter>
  );
}
