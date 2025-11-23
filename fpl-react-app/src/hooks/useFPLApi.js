import { useState } from "react";

export function useFPLApi() {
  const [cache, setCache] = useState({});

  const fetchWithCache = async (key, url) => {
    if (cache[key]) return cache[key];

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("API request Failed");
      const data = await response.json();
      setCache((prev = { ...prev, [key]: data }));
      return data;
    } catch (err) {
      console.error("API Error:", err);
      throw err;
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
  const getFixtures = () => {
    fetchWithCache(
      "fixtures",
      "https://fantasy.premierleague.com/api/fixtures/"
    );
  };

  return { getBootstrap, getLive, getFixtures };
}
