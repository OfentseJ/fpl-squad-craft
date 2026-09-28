import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

function localApiProxyPlugin() {
  return {
    name: "local-api-proxy",
    configureServer(server) {
      server.middlewares.use("/api/proxy", async (req, res) => {
        try {
          const host = req.headers.host || "localhost";
          const protocol = req.headers["x-forwarded-proto"] || "http";
          const parsedUrl = new URL(req.url, `${protocol}://${host}`);
          const targetUrl = parsedUrl.searchParams.get("url");

          if (!targetUrl) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Missing URL parameter" }));
            return;
          }

          const response = await fetch(targetUrl);
          res.statusCode = response.status;
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Access-Control-Allow-Origin", "*");
          const data = await response.text();
          res.end(data);
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Failed to fetch data: " + error.message }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), localApiProxyPlugin()],
  base: "/",
});
