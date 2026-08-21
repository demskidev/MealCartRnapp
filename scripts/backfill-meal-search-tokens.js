#!/usr/bin/env node
/**
 * Re-indexes `nameCharacters` on every meal so search matches at any word
 * boundary ("egg" / "egg roll" -> "Chicken Egg Roll"), not just from the first
 * letter of the name.
 *
 * Meals created before this change carry the old whole-name-prefix tokens. The
 * new token list is a strict superset, so this backfill only ever ADDS matches
 * — it can be re-run safely, and it skips documents that are already correct.
 * Meals created/renamed from the app after this change index themselves.
 *
 *   node scripts/backfill-meal-search-tokens.js --dry-run   # report, write nothing
 *   node scripts/backfill-meal-search-tokens.js
 *
 * Credentials (admin SDK, so it bypasses firestore.rules and covers every
 * user's meals plus the global catalog) — either:
 *   gcloud auth application-default login          # then set --project if needed
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/sa.json node scripts/...
 */

const path = require("path");
const { createRequire } = require("module");

const DEFAULT_PROJECT_ID = "mealcart-5d62b"; // matches services/firebase.ts
const MEALS_COLLECTION = "meals";
const PAGE_SIZE = 300;
const BATCH_SIZE = 400; // Firestore caps a write batch at 500

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const projectId =
  (args.includes("--project") ? args[args.indexOf("--project") + 1] : null) ||
  process.env.GOOGLE_CLOUD_PROJECT ||
  DEFAULT_PROJECT_ID;

// ---------------------------------------------------------------------------
// Keep in sync with buildNameSearchTokens / normalizeSearchText in
// utils/searchTokens.ts — that TS module is the app-side source of truth, and a
// plain Node script can't import it. See the notes there for the token shape.
const MAX_TOKEN_LENGTH = 40;
const MAX_TOKENS = 500;

const normalizeSearchText = (text) =>
  (text ?? "").toLowerCase().replace(/\s+/g, " ").trim();

const buildNameSearchTokens = (name) => {
  const normalized = normalizeSearchText(name);
  if (!normalized) return [];

  const wordStarts = [0];
  for (let i = 0; i < normalized.length - 1; i++) {
    if (normalized[i] === " ") wordStarts.push(i + 1);
  }

  const tokens = new Set();
  for (const start of wordStarts) {
    const suffix = normalized.slice(start);
    const longest = Math.min(suffix.length, MAX_TOKEN_LENGTH);
    for (let end = 1; end <= longest; end++) {
      const token = suffix.slice(0, end);
      if (token.endsWith(" ")) continue;
      tokens.add(token);
      if (tokens.size >= MAX_TOKENS) return Array.from(tokens);
    }
  }
  return Array.from(tokens);
};
// ---------------------------------------------------------------------------

// firebase-admin is a dependency of ./functions, not of the app.
function loadAdmin() {
  const candidates = [
    () => require("firebase-admin"),
    () =>
      createRequire(path.join(process.cwd(), "functions", "package.json"))(
        "firebase-admin",
      ),
  ];
  for (const load of candidates) {
    try {
      return load();
    } catch (error) {
      if (error.code !== "MODULE_NOT_FOUND") throw error;
    }
  }
  console.error(
    "\n✖ firebase-admin not found. Run `npm install` inside ./functions first.\n",
  );
  process.exit(1);
}

const sameTokens = (a, b) => {
  if (!Array.isArray(a) || a.length !== b.length) return false;
  const seen = new Set(a);
  return b.every((token) => seen.has(token));
};

async function main() {
  const admin = loadAdmin();
  admin.initializeApp({ projectId });
  const db = admin.firestore();

  let cursor = null;
  let scanned = 0;
  let updated = 0;
  let skippedNoName = 0;

  for (;;) {
    let query = db
      .collection(MEALS_COLLECTION)
      .orderBy(admin.firestore.FieldPath.documentId())
      .limit(PAGE_SIZE);
    if (cursor) query = query.startAfter(cursor);

    const snapshot = await query.get();
    if (snapshot.empty) break;

    let batch = db.batch();
    let pending = 0;

    for (const doc of snapshot.docs) {
      scanned += 1;
      const name = doc.get("name");
      if (typeof name !== "string" || !name.trim()) {
        skippedNoName += 1;
        continue;
      }

      const tokens = buildNameSearchTokens(name);
      if (sameTokens(doc.get("nameCharacters"), tokens)) continue;

      updated += 1;
      if (dryRun) {
        console.log(`  would reindex ${doc.id}  "${name}"  (${tokens.length} tokens)`);
        continue;
      }

      batch.update(doc.ref, { nameCharacters: tokens });
      pending += 1;
      if (pending >= BATCH_SIZE) {
        await batch.commit();
        batch = db.batch();
        pending = 0;
      }
    }

    if (pending > 0) await batch.commit();

    cursor = snapshot.docs[snapshot.docs.length - 1];
    if (snapshot.size < PAGE_SIZE) break;
  }

  console.log(
    `\n${dryRun ? "[dry run] " : ""}scanned ${scanned} meals, ` +
      `${dryRun ? "would reindex" : "reindexed"} ${updated}` +
      (skippedNoName ? `, skipped ${skippedNoName} with no name` : "") +
      "\n",
  );
}

main().catch((error) => {
  console.error(`\n✖ ${error.message}\n`);
  process.exit(1);
});
