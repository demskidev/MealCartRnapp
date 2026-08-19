#!/usr/bin/env node
/**
 * Bumps `expo.version` in app.json (mirrored into package.json).
 *
 * Needed because eas.json sets `appVersionSource: "remote"`, so EAS increments
 * only `versionCode` / `buildNumber` — the `version` string that App Store
 * Connect checks when deciding whether a build can be released as an update
 * always comes from app.json. `npm run build:android` runs this first.
 *
 *   npm run bump                    # 1.0.1 -> 1.0.2
 *   BUMP_LEVEL=minor npm run bump   # 1.0.1 -> 1.1.0   (also: major)
 *   npm run bump -- --set 1.2.3     # explicit
 *   npm run bump -- --dry-run       # print, change nothing
 *
 * Run `npx eas build` directly to build without bumping.
 */

const fs = require("fs");
const path = require("path");

// Invoked via npm scripts, so cwd is the repo root (as in reset-project.js).
const ROOT = process.cwd();
const VERSION_RE = /"version":\s*"(\d+)\.(\d+)\.(\d+)"/;
const FILES = [path.join(ROOT, "app.json"), path.join(ROOT, "package.json")];

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const explicit = args[args.indexOf("--set") + 1];
const level = process.env.BUMP_LEVEL ?? "patch";

function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

const match = fs.readFileSync(FILES[0], "utf8").match(VERSION_RE) ?? fail("No version in app.json");
const [major, minor, patch] = match.slice(1).map(Number);
const current = `${major}.${minor}.${patch}`;

let next;
if (args.includes("--set")) {
  next = /^\d+\.\d+\.\d+$/.test(explicit) ? explicit : fail(`--set wants x.y.z, got "${explicit}"`);
} else if (level === "major") {
  next = `${major + 1}.0.0`;
} else if (level === "minor") {
  next = `${major}.${minor + 1}.0`;
} else {
  next = `${major}.${minor}.${patch + 1}`;
}

for (const file of FILES) {
  const raw = fs.readFileSync(file, "utf8");
  // Rewrite just the matched line so the file's formatting survives; bail if the
  // shape isn't what we expect rather than editing the wrong field.
  const hits = raw.match(new RegExp(VERSION_RE.source, "g")) ?? [];
  if (hits.length !== 1) {
    fail(`Expected 1 "version" field in ${path.basename(file)}, found ${hits.length}`);
  }
  if (!dryRun) {
    fs.writeFileSync(file, raw.replace(VERSION_RE, `"version": "${next}"`));
  }
}

console.log(`${dryRun ? "[dry run]" : "✓"} version ${current} → ${next}`);
