import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "fpl-planner-watchlist";

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error("Error reading watchlist from localStorage:", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
    } catch (error) {
      console.error("Error writing watchlist to localStorage:", error);
    }
  }, [watchlist]);

  const toggleWatchlist = useCallback((playerId) => {
    setWatchlist((prev) => {
      const id = playerId.toString();
      if (prev.includes(id)) {
        return prev.filter((pId) => pId !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

  const isInWatchlist = useCallback(
    (playerId) => {
      return watchlist.includes(playerId.toString());
    },
    [watchlist],
  );

  return { watchlist, toggleWatchlist, isInWatchlist };
}
