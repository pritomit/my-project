#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");

const INPUT_FILES = [
  path.join(ROOT_DIR, "alltv.m3u8"),
  path.join(ROOT_DIR, "github.m3u"),
  path.join(ROOT_DIR, "fallback.m3u")
];
const OUTPUT_FILE = path.join(ROOT_DIR, "fallback.m3u");
const CONCURRENCY = 20;
const TIMEOUT_MS = 7000;

function parseM3u(content) {
  const lines = content.split(/\r?\n/);
  const items = [];
  let extinf = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("#EXTINF")) {
      extinf = line;
    } else if (!line.startsWith("#")) {
      if (/^https?:\/\//i.test(line)) {
        items.push({
          extinf: extinf || `#EXTINF:-1 group-title="Global",Channel ${items.length + 1}`,
          url: line
        });
      }
      extinf = null;
    }
  }
  return items;
}

async function isStreamAlive(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0 Safari/537.36"
      }
    });
    if (!res.ok) {
      res.body?.cancel().catch(() => {});
      return false;
    }
    const ct = (res.headers.get("content-type") || "").toLowerCase();
    if (ct.includes("video/") || ct.includes("octet-stream") || ct.includes("mp2t")) {
      res.body?.cancel().catch(() => {});
      return true;
    }
    const reader = res.body?.getReader();
    if (!reader) return false;
    const { value } = await reader.read();
    reader.cancel().catch(() => {});
    const sample = new TextDecoder().decode(value || new Uint8Array()).trim();
    return sample.includes("#EXTM3U") || sample.includes("#EXT-X-") || ct.includes("mpegurl");
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

async function runPool(items, worker, limit) {
  const results = [];
  let index = 0;
  async function next() {
    while (index < items.length) {
      const i = index++;
      if (await worker(items[i])) results.push(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, next));
  return results;
}

async function main() {
  const uniqueByUrl = new Map();
  for (const fullPath of INPUT_FILES) {
    if (!fs.existsSync(fullPath)) continue;
    for (const item of parseM3u(fs.readFileSync(fullPath, "utf8"))) {
      if (!uniqueByUrl.has(item.url)) uniqueByUrl.set(item.url, item);
    }
  }
  const allItems = Array.from(uniqueByUrl.values());
  if (!allItems.length) {
    console.log("No input playlists found.");
    return;
  }
  console.log(`Checking ${allItems.length} streams...`);
  const alive = await runPool(allItems, item => isStreamAlive(item.url), CONCURRENCY);
  alive.sort((a, b) => (b.url.startsWith("https://") ? 1 : 0) - (a.url.startsWith("https://") ? 1 : 0));

  const out = [
    "#EXTM3U",
    `# Updated: ${new Date().toISOString()} | Working: ${alive.length}/${allItems.length}`,
    ""
  ];
  for (const ch of alive) {
    out.push(ch.extinf);
    out.push(ch.url);
  }
  fs.writeFileSync(OUTPUT_FILE, out.join("\n") + "\n", "utf8");
  console.log(`Saved ${alive.length}/${allItems.length} working streams to ${OUTPUT_FILE}`);
}

main();
