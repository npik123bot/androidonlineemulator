import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const TARGET_URL = "https://www.apkonline.net";

serve(async (req) => {
  const url = new URL(req.url);
  
  // If requesting the home page, serve our custom HTML
  if (url.pathname === "/" || url.pathname === "/index.html") {
    const html = await Deno.readTextFile("./index.html");
    return new Response(html, { headers: { "content-type": "text/html" } });
  }

  // Otherwise, proxy the request to ApkOnline
  const proxyUrl = new URL(url.pathname + url.search, TARGET_URL);
  const headers = new Headers(req.headers);
  headers.set("Host", proxyUrl.hostname);

  try {
    const response = await fetch(proxyUrl.toString(), {
      method: req.method,
      headers: headers,
      body: req.body,
      redirect: "follow",
    });
    return response;
  } catch (e) {
    return new Response("Proxy Error: " + e.message, { status: 500 });
  }
});
