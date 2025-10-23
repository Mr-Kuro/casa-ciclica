#!/usr/bin/env node
import { readdirSync, statSync, readFileSync } from "fs";
import { join } from "path";

const root = process.cwd();
const srcDir = join(root, "src");
let legacyHits = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full);
    else if (/\.(tsx?|jsx?)$/.test(entry)) {
      const txt = readFileSync(full, "utf8");
      if (txt.includes("views/components")) {
        // Allow reference inside dependency guard tests as part of enforcement
        if (!full.endsWith("dependencyGuards.test.ts")) {
          legacyHits.push(full);
        }
      }
    }
  }
}

walk(srcDir);

// Check existence of legacy directory
const legacyDir = join(srcDir, "views", "components");
try {
  if (statSync(legacyDir).isDirectory()) {
    legacyHits.push(legacyDir + " (directory exists)");
  }
} catch {}

if (legacyHits.length) {
  console.error("\u274C Legacy view component references found:");
  legacyHits.forEach((h) => console.error(" -", h));
  process.exit(1);
} else {
  console.log("\u2705 No legacy view component references.");
}
