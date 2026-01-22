import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// Force a specific target domain
const TARGET = "https://www.apkonline.net";

serve(async (req) => {
  const url = new URL(req.url);

  // Serve the local index.html
  if (url.pathname === "/" || url.pathname === "/index.html") {
    try {
      const html = await Deno.readTextFile("./index.html");
      return new Response(html, { headers: { "content-type": "text/html" } });
    } catch {
      return new Response("Error: index.html missing.", { status: 404 });
    }
  }

  // 1. Manually resolve the DNS using Google's DNS server
  // This bypasses the school's blocked DNS entries
  let targetIp = "144.76.37.158"; // This is the last known IP for apkonline.net
  
  try {
    const dnsRecords = await Deno.resolveDns("www.apkonline.net", "A", {
      nameServer: { ipAddr: "8.8.8.8", port: 53 },
    });
    if (dnsRecords.length > 0) targetIp = dnsRecords[0];
  } catch (e) {
    console.log("DNS Manual Resolve failed, using fallback IP.");
  }

  // 2. Build the new proxy URL using the IP to avoid another DNS lookup
  const proxyUrl = new URL(url.pathname + url.search, `http://${targetIp}`);

  const headers = new Headers(req.headers);
  headers.set("Host", "www.apkonline.net"); // This is required for the server to accept the IP
  headers.delete("referer");

  try {
    const response = await fetch(proxyUrl.toString(), {
      method: req.method,
      headers: headers,
      body: req.body,
      redirect: "follow",
    });

    return response;
  } catch (err) {
    return new Response(`Final Proxy Error: ${err.message}. The school has likely blocked the IP address directly.`, { status: 502 });
  }
});
