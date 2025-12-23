export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Missing URL parameter" });
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({ error: "Upstream API error" });
    }

    const data = await response.json();

    // Set CORS headers to allow your React app to read this
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
    );

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch data" });
  }
}
