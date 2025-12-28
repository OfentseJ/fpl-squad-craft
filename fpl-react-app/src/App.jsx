import { Routes, Route, HashRouter } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import LoadingSkeleton from "./components/LoadingSkeleton";
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

  if (loading) return <LoadingSkeleton />;
  if (error)
    return (
      <ErrorDisplay message={error} retry={() => window.location.reload()} />
    );

  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-200 transition-colors">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home data={data} />} />
          <Route path="/trends" element={<Trends data={data} />} />
          <Route path="/live" element={<Live data={data} />} />
          <Route path="/planner" element={<Planner data={data} />} />
        </Routes>
      </div>
    </HashRouter>
  );
}
