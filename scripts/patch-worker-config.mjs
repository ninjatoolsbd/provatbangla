// Nitro's generated Worker config drops compatibility_flags, but the bundle
// imports node: built-ins, so `wrangler deploy` needs nodejs_compat enabled.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const candidates = ["dist/server/wrangler.json", "dist/_worker.js/wrangler.json"];
const path = candidates.find((candidate) => existsSync(candidate));

if (!path) {
  console.log("[patch-worker-config] no generated wrangler config found, skipping");
  process.exit(0);
}

const config = JSON.parse(readFileSync(path, "utf8"));
const flags = new Set(config.compatibility_flags ?? []);
flags.add("nodejs_compat");
config.compatibility_flags = [...flags];
writeFileSync(path, `${JSON.stringify(config, null, 2)}\n`);
console.log(`[patch-worker-config] ${path}: compatibility_flags = ${config.compatibility_flags.join(", ")}`);
