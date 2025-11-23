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
      `live-${gw}`,
      `https://fantasy.premierleague.com/api/event/${gw}/live/`
    );

  const getFixtures = () =>
    fetchWithCache(
      "fixtures",
      "https://fantasy.premierleague.com/api/fixtures/"
    );

  return { getBootstrap, getLive, getFixtures };
}
