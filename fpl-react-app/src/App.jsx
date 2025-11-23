import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import DarkModeToggle from "./components/DarkModeToggle";
import LoadingSkeleton from "./components/LoadingSkeleton";
import ErrorDisplay from "./components/ErrorDisplay";
import Home from "./pages/Home";
import Trends from "./pages/Trends";
import Live from "./pages/Live";
import Planner from "./pages/Planner";
import { useFPLApi } from "./hooks/useFPLApi";
import { DarkModeContext } from "./context/DarkModeContext";

export default function App() {
  const [dark, setDark] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { getBootstrap } = useFPLApi();

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

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
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (error)
    return (
      <ErrorDisplay message={error} retry={() => window.location.reload()} />
    );

  return (
    <DarkModeContext.Provider value={{ dark, setDark }}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-200 transition-colors">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home data={data} />} />
            <Route path="/trends" element={<Trends data={data} />} />
            <Route path="/live" element={<Live data={data} />} />
            <Route path="/planner" element={<Planner data={data} />} />
          </Routes>
          <DarkModeToggle />
        </div>
      </BrowserRouter>
    </DarkModeContext.Provider>
  );
}
