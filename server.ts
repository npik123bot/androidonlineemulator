import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// The numerical IP address for the emulator server (Bypasses DNS Blocks)
const TARGET_IP = "http://144.76.37.158"; 

serve(async (req) => {
  const url = new URL(req.url);
  
  if (url.pathname === "/" || url.pathname === "/index.html") {
    const html = await Deno.readTextFile("./index.html");
    return new Response(html, { headers: { "content-type": "text/html" } });
  }

  // Proxy the request using the IP directly
  const proxyUrl = new URL(url.pathname + url.search, TARGET_IP);
  const headers = new Headers(req.headers);
  
  // Mask the "Host" header so the target server doesn't reject us
  headers.set("Host", "www.apkonline.net");
  headers.delete("referer");

  try {
    const response = await fetch(proxyUrl.toString(), {
      method: req.method,
      headers: headers,
      body: req.body,
      redirect: "manual", // Stops the server from forcing a redirect to the blocked .net domain
    });
    return response;
  } catch (e) {
    return new Response("System Update in Progress... Please wait.", { status: 500 });
  }
});
