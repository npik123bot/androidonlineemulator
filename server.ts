import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const TARGET_DOMAIN = "https://www.apkonline.net";

serve(async (req) => {
  const url = new URL(req.url);
  
  // 1. Serve your HTML file first
  if (url.pathname === "/" || url.pathname === "/index.html") {
    try {
      const html = await Deno.readTextFile("./index.html");
      return new Response(html, { headers: { "content-type": "text/html" } });
    } catch (e) {
      return new Response("Error: index.html not found in GitHub repo.", { status: 404 });
    }
  }

  // 2. Proxy all other requests to the emulator
  const proxyUrl = new URL(url.pathname + url.search, TARGET_DOMAIN);
  
  const headers = new Headers(req.headers);
  headers.set("Host", "www.apkonline.net");
  headers.delete("referer"); // Helps bypass some simple filter checks

  try {
    const response = await fetch(proxyUrl.toString(), {
      method: req.method,
      headers: headers,
      body: req.body,
      // Change to 'follow' to let Deno handle redirects automatically
      redirect: "follow", 
    });

    return response;
  } catch (err) {
    console.error("Fetch error:", err);
    return new Response(`Proxy Connection Failed: ${err.message}`, { status: 502 });
  }
});
