import { useRef, useCallback } from "react";

export function useFPLApi() {
  const cache = useRef({});

  const CORS_PROXY = "https://corsproxy.io/?";

  const fetchWithCache = useCallback(async (key, url) => {
    if (cache.current[key]) return cache.current[key];

    try {
      const response = await fetch(CORS_PROXY + encodeURIComponent(url));
      if (!response.ok) throw new Error("API request failed");

      const data = await response.json();

      cache.current[key] = data;

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }, []);

  const getBootstrap = useCallback(
    () =>
      fetchWithCache(
        "bootstrap",
        "https://fantasy.premierleague.com/api/bootstrap-static/"
      ),
    [fetchWithCache]
  );

  const getLive = useCallback(
    (gw) =>
      fetchWithCache(
        "live-" + gw,
        `https://fantasy.premierleague.com/api/event/${gw}/live/`
      ),
    [fetchWithCache]
  );

  const getFixtures = useCallback(
    () =>
      fetchWithCache(
        "fixtures",
        "https://fantasy.premierleague.com/api/fixtures/"
      ),
    [fetchWithCache]
  );

  // These don't rely on fetch/cache, but good practice to memoize or keep outside component
  const getShirtUrl = useCallback((team, isGK) => {
    return `https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${
      team?.code || 3
    }${isGK ? "_1" : ""}-66.png`;
  }, []);

  const getPlayerImageUrl = useCallback((playerCode) => {
    if (!playerCode) return null;
    return `https://resources.premierleague.com/premierleague/photos/players/110x140/p${playerCode}.png`;
  }, []);

  const getTeamBadgeUrl = useCallback((teamCode) => {
    if (!teamCode) return null;
    return `https://resources.premierleague.com/premierleague/badges/t${teamCode}.png`;
  }, []);

  const importUserTeam = useCallback(async (teamId, gameweek) => {
    try {
      // We generally don't cache user imports as they might change active transfers
      const url = `https://fantasy.premierleague.com/api/entry/${teamId}/event/${gameweek}/picks/`;
      const response = await fetch(CORS_PROXY + encodeURIComponent(url));

      if (!response.ok) {
        throw new Error("Failed to fetch team data. Please check the Team ID.");
      }

      const data = await response.json();
      return data.picks;
    } catch (error) {
      console.error("Import Team Error:", error);
      throw error;
    }
  }, []);

  const getUserTeamInfo = useCallback(async (teamId) => {
    try {
      const url = `https://fantasy.premierleague.com/api/entry/${teamId}/`;
      const response = await fetch(CORS_PROXY + encodeURIComponent(url));

      if (!response.ok) {
        throw new Error("Failed to fetch team info.");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Get Team Info Error:", error);
      throw error;
    }
  }, []);

  return {
    getBootstrap,
    getLive,
    getFixtures,
    getShirtUrl,
    getPlayerImageUrl,
    getTeamBadgeUrl,
    importUserTeam,
    getUserTeamInfo,
  };
}
