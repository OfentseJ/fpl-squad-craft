import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "fpl-planner-watchlist";
const EVENT_KEY = "fpl-watchlist-updated";

export function useWatchlist() {
  // Read initial state safely
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error(error);
      return [];
    }
  });

  // Force update from local storage
  const syncWatchlist = useCallback(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      setWatchlist(item ? JSON.parse(item) : []);
    } catch (error) {
      console.error(error);
    }
  }, []);

  // Listen for changes
  useEffect(() => {
    window.addEventListener(EVENT_KEY, syncWatchlist);
    window.addEventListener("storage", syncWatchlist);

    return () => {
      window.removeEventListener(EVENT_KEY, syncWatchlist);
      window.removeEventListener("storage", syncWatchlist);
    };
  }, [syncWatchlist]);

  // Toggle function
  const toggleWatchlist = useCallback((playerId) => {
    const id = playerId.toString();

    // Read fresh from LS to avoid stale state closures
    const currentJSON = window.localStorage.getItem(STORAGE_KEY);
    const currentList = currentJSON ? JSON.parse(currentJSON) : [];

    let newList;
    if (currentList.includes(id)) {
      newList = currentList.filter((pId) => pId !== id);
    } else {
      newList = [...currentList, id];
    }

    // 1. Update LocalStorage
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));

    // 2. Update Local State (Immediate Feedback)
    setWatchlist(newList);

    // 3. Broadcast Event (Sync other components)
    window.dispatchEvent(new Event(EVENT_KEY));
  }, []);

  // Check function
  const isInWatchlist = useCallback(
    (playerId) => {
      return watchlist.includes(playerId.toString());
    },
    [watchlist],
  );

  return { watchlist, toggleWatchlist, isInWatchlist };
}
