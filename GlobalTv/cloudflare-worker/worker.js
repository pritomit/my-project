// PritomX Global TV HuB — Cloudflare Worker Stream Proxy
// Deploy to: https://pritom-worker-tv.pritomsiddique226.workers.dev/

// নিরাপত্তা বাড়াতে আপনার লাইভ ডোমেইনগুলো এখানে বসান। খালি অ্যারে [] রাখলে সব ডোমেইন থেকে কাজ করবে।
const ALLOWED_ORIGINS = [
  // "https://your-site.infinityfreeapp.com",
  // "https://pritomx-tv.vercel.app"
];

export default {
  async fetch(request) {
    const reqUrl = new URL(request.url);
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(origin) });
    }

    if (ALLOWED_ORIGINS.length > 0 && origin && !ALLOWED_ORIGINS.includes(origin)) {
      return new Response("Forbidden Origin", { status: 403 });
    }

    const target = reqUrl.searchParams.get("url");
    if (!target) {
      return new Response("PritomX Worker Active — Use ?url=https://...", {
        status: 200,
        headers: corsHeaders(origin)
      });
    }

    try {
      const targetUrl = new URL(target);
      if (!["http:", "https:"].includes(targetUrl.protocol)) {
        return new Response("Invalid protocol", { status: 400, headers: corsHeaders(origin) });
      }

      // SSRF protection: block localhost and private IP ranges
      const host = targetUrl.hostname.toLowerCase();
      if (
        host === "localhost" ||
        host.endsWith(".local") ||
        /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.)/.test(host)
      ) {
        return new Response("Blocked host", { status: 403, headers: corsHeaders(origin) });
      }

      const upstream = await fetch(targetUrl.toString(), {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0 Safari/537.36",
          "Referer": targetUrl.origin + "/"
        },
        redirect: "follow"
      });

      const contentType = (upstream.headers.get("content-type") || "").toLowerCase();
      const isManifest = targetUrl.pathname.endsWith(".m3u8") || contentType.includes("mpegurl");

      if (isManifest) {
        const text = await upstream.text();
        const proxyPrefix = `${reqUrl.origin}/?url=`;
        const rewritten = text.split(/\r?\n/).map(line => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) {
            return line.replace(/URI="([^"]+)"/g, (_, uri) => {
              const abs = new URL(uri, targetUrl).toString();
              return `URI="${proxyPrefix}${encodeURIComponent(abs)}"`;
            });
          }
          const abs = new URL(trimmed, targetUrl).toString();
          return `${proxyPrefix}${encodeURIComponent(abs)}`;
        }).join("\n");

        return new Response(rewritten, {
          status: upstream.status,
          headers: {
            ...corsHeaders(origin),
            "Content-Type": "application/vnd.apple.mpegurl",
            "Cache-Control": "no-cache"
          }
        });
      }

      const headers = new Headers(upstream.headers);
      Object.entries(corsHeaders(origin)).forEach(([k, v]) => headers.set(k, v));
      return new Response(upstream.body, { status: upstream.status, headers });
    } catch (err) {
      return new Response(`Proxy error: ${err.message}`, { status: 502, headers: corsHeaders(origin) });
    }
  }
};

function corsHeaders(origin = "*") {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "*"
  };
}
