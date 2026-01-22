import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// This is "https://www.apkonline.net" encoded in Base64
const encodedTarget = "aHR0cHM6Ly93d3cuYXBrb25saW5lLm5ldA==";
const TARGET_URL = atob(encodedTarget);

serve(async (req) => {
  const url = new URL(req.url);
  
  if (url.pathname === "/" || url.pathname === "/index.html") {
    try {
      const html = await Deno.readTextFile("./index.html");
      return new Response(html, { headers: { "content-type": "text/html" } });
    } catch {
      return new Response("Index file not found", { status: 404 });
    }
  }

  // Rewrite the URL to the hidden target
  const proxyUrl = new URL(url.pathname + url.search, TARGET_URL);
  
  const headers = new Headers(req.headers);
  headers.set("Host", proxyUrl.hostname);
  // Remove referrer to hide where the request is coming from
  headers.delete("referer");

  try {
    const response = await fetch(proxyUrl.toString(), {
      method: req.method,
      headers: headers,
      body: req.body,
      redirect: "follow",
    });

    // If we get a 403/Blocked response, it means the proxy is detected
    if (response.status === 403) {
      return new Response("Access Denied by Filter. Try a different Network.", { status: 403 });
    }

    return response;
  } catch (e) {
    // This is the error you saw in your screenshot
    return new Response("Connection Error: The target site is blocked at the DNS level.", { status: 500 });
  }
});
