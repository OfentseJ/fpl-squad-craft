import { useCallback } from "react";
import liverpoolBadge from "../assets/badges/liverpool.webp";

export function useFPLApi() {
  const PROXY_ENDPOINT = "/api/proxy?url=";

  const fetchFPL = useCallback(
    async (url) => {
      try {
        const response = await fetch(PROXY_ENDPOINT + encodeURIComponent(url));
        if (!response.ok) throw new Error("API request failed");
        return await response.json();
      } catch (error) {
        console.error("API Error:", error);
        throw error;
      }
    },
    [],
  );

  const getBootstrap = useCallback(
    () => fetchFPL("https://fantasy.premierleague.com/api/bootstrap-static/"),
    [fetchFPL],
  );

  const getLive = useCallback(
    (gw) => fetchFPL(`https://fantasy.premierleague.com/api/event/${gw}/live/`),
    [fetchFPL],
  );

  const getFixtures = useCallback(
    () => fetchFPL("https://fantasy.premierleague.com/api/fixtures/"),
    [fetchFPL],
  );

  const getShirtUrl = useCallback((team, isGK) => {
    return `https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${
      team?.code || 3
    }${isGK ? "_1" : ""}-66.png`;
  }, []);

  const getPlayerImageUrl = useCallback((playerCode) => {
    if (!playerCode) return null;
    return `https://resources.premierleague.com/premierleague25/photos/players/110x140/${playerCode}.png`;
  }, []);

  const getTeamBadgeUrl = useCallback((teamCode) => {
    if (!teamCode) return null;
    if (teamCode === 14) {
      return liverpoolBadge;
    }
    return `https://resources.premierleague.com/premierleague/badges/t${teamCode}.png`;
  }, []);

  const importUserTeam = useCallback(
    async (teamId, gameweek) => {
      try {
        const url = `https://fantasy.premierleague.com/api/entry/${teamId}/event/${gameweek}/picks/`;
        const response = await fetch(PROXY_ENDPOINT + encodeURIComponent(url));

        if (!response.ok) {
          throw new Error(
            "Failed to fetch team data. Please check the Team ID.",
          );
        }

        const data = await response.json();
        return data.picks;
      } catch (error) {
        console.error("Import Team Error:", error);
        throw error;
      }
    },
    [],
  );

  const getUserTeamInfo = useCallback(
    async (teamId) => {
      try {
        const url = `https://fantasy.premierleague.com/api/entry/${teamId}/`;
        const response = await fetch(PROXY_ENDPOINT + encodeURIComponent(url));

        if (!response.ok) {
          throw new Error("Failed to fetch team info.");
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Get Team Info Error:", error);
        throw error;
      }
    },
    [],
  );

  const getEntryHistory = useCallback(
    async (teamId) => {
      try {
        const url = `https://fantasy.premierleague.com/api/entry/${teamId}/history/`;
        const response = await fetch(PROXY_ENDPOINT + encodeURIComponent(url));

        if (!response.ok) {
          throw new Error("Failed to fetch team history.");
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Get Team History Error:", error);
        throw error;
      }
    },
    [],
  );

  // --- NEW FUNCTION ADDED HERE ---
  const getPlayerHistory = useCallback(
    (playerId) => fetchFPL(`https://fantasy.premierleague.com/api/element-summary/${playerId}/`),
    [fetchFPL],
  );

  return {
    getBootstrap,
    getLive,
    getFixtures,
    getShirtUrl,
    getPlayerImageUrl,
    getTeamBadgeUrl,
    importUserTeam,
    getUserTeamInfo,
    getEntryHistory,
    getPlayerHistory,
  };
}
