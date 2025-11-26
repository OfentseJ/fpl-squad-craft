import { useState } from "react";

export function useFPLApi() {
  const [cache, setCache] = useState({});

  const CORS_PROXY = "https://corsproxy.io/?";

  const fetchWithCache = async (key, url) => {
    if (cache[key]) return cache[key];

    try {
      const response = await fetch(CORS_PROXY + encodeURIComponent(url));
      if (!response.ok) throw new Error("API request failed");
      const data = await response.json();
      setCache((prev) => ({ ...prev, [key]: data }));
      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  };

  const getBootstrap = () =>
    fetchWithCache(
      "bootstrap",
      "https://fantasy.premierleague.com/api/bootstrap-static/"
    );

  const getLive = (gw) =>
    fetchWithCache(
      "live-" + gw,
      `https://fantasy.premierleague.com/api/event/${gw}/live/`
    );

  const getFixtures = () =>
    fetchWithCache(
      "fixtures",
      "https://fantasy.premierleague.com/api/fixtures/"
    );

  const getShirtUrl = (team, isGK) => {
    return `https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${
      team?.code || 3
    }${isGK ? "_1" : ""}-66.png`;
  };

  const getPlayerImageUrl = (playerCode) => {
    if (!playerCode) return null;
    return `https://resources.premierleague.com/premierleague/photos/players/110x140/p${playerCode}.png`;
  };

  const getTeamBadgeUrl = (teamCode) => {
    if (!teamCode) return null;
    return `https://resources.premierleague.com/premierleague/badges/t${teamCode}.png`;
  };

  return {
    getBootstrap,
    getLive,
    getFixtures,
    getShirtUrl,
    getPlayerImageUrl,
    getTeamBadgeUrl,
  };
}
