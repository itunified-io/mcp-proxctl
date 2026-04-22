#!/usr/bin/env node
// ADR-0026: Pre-publish security scan.
// Blocks `npm publish` if forbidden files would be included in the tarball.

import { execFileSync } from "node:child_process";

const FORBIDDEN = [
  /\.mcpregistry_/,
  /\.env$/,
  /\.pem$/,
  /\.key$/,
  /credentials/i,
  /\.secrets/,
  /secret.*\.json/i,
];

try {
  const output = execFileSync("npm", ["pack", "--dry-run"], {
    encoding: "utf-8",
    stdio: ["pipe", "pipe", "pipe"],
  });

  const lines = output.split("\n").filter((l) => l.trim());

  const violations = [];
  for (const line of lines) {
    for (const pattern of FORBIDDEN) {
      if (pattern.test(line)) {
        violations.push(line.trim());
      }
    }
  }

  if (violations.length > 0) {
    console.error("\n[SECURITY] Forbidden files detected in npm tarball:\n");
    for (const v of violations) {
      console.error(`  - ${v}`);
    }
    console.error(
      "\nAdd these files to .npmignore or remove them before publishing.\n",
    );
    process.exit(1);
  }

  console.log("[prepublish-check] OK — no forbidden files in tarball");
} catch (err) {
  console.error("[prepublish-check] Failed to run npm pack --dry-run:", err);
  process.exit(1);
}
