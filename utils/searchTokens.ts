/**
 * Search-token index for meal names.
 *
 * Firestore has no substring / full-text operator, so meal search is done with
 * `nameCharacters array-contains <query>` against a token list written onto the
 * meal document. The tokens therefore decide what a user can type and still get
 * a hit.
 *
 * Originally the tokens were the prefixes of the whole name
 * (`name.substring(0, i)`), so "chicken egg roll" was findable only by typing
 * from the very first letter — "chick" matched, "egg" and "egg roll" did not.
 * We now index the prefixes of every **word-boundary suffix**, i.e. for
 * "chicken egg roll":
 *
 *   from offset 0  -> "c", "ch", ... "chicken egg roll"
 *   from "egg roll" -> "e", "eg", "egg", "egg r", ... "egg roll"
 *   from "roll"     -> "r", "ro", "rol", "roll"
 *
 * so any query that starts at a word boundary and runs forward (a single word,
 * or a phrase spanning words) matches. This is a superset of the old prefix
 * list, so a document written with the old format still behaves exactly as
 * before until it is re-indexed (see scripts/backfill-meal-search-tokens.js).
 *
 * Mid-word queries ("hicken", "oll") are deliberately NOT indexed: indexing
 * every substring of every name would multiply the token count by the name
 * length again for no realistic gain in how people search.
 *
 * NOTE: scripts/backfill-meal-search-tokens.js contains a plain-JS copy of
 * `buildNameSearchTokens` (a Node script can't import this TS module). Keep the
 * two in sync — a divergence means backfilled meals index differently from
 * newly created ones.
 */

/** Longest query we index. Anything longer can only match by paging/filtering. */
const MAX_TOKEN_LENGTH = 40;

/** Safety cap on tokens per document, for pathologically long names. */
const MAX_TOKENS = 500;

/**
 * Canonical form used on BOTH sides of the query: lowercase, collapse runs of
 * whitespace to a single space, trim. Both the stored tokens and the search
 * text must go through this or "Egg  Roll" won't match "egg roll".
 */
export const normalizeSearchText = (text?: string | null): string =>
  (text ?? "").toLowerCase().replace(/\s+/g, " ").trim();

/**
 * Build the `nameCharacters` index for a meal name. Written on create *and* on
 * rename, otherwise a renamed meal stays searchable only under its old name.
 */
export const buildNameSearchTokens = (name?: string | null): string[] => {
  const normalized = normalizeSearchText(name);
  if (!normalized) return [];

  // Every offset a query is allowed to start at: the name itself plus each
  // character following a space.
  const wordStarts = [0];
  for (let i = 0; i < normalized.length - 1; i++) {
    if (normalized[i] === " ") wordStarts.push(i + 1);
  }

  const tokens = new Set<string>();
  for (const start of wordStarts) {
    const suffix = normalized.slice(start);
    const longest = Math.min(suffix.length, MAX_TOKEN_LENGTH);
    for (let end = 1; end <= longest; end++) {
      const token = suffix.slice(0, end);
      // A trailing space adds nothing: queries are trimmed before matching.
      if (token.endsWith(" ")) continue;
      tokens.add(token);
      if (tokens.size >= MAX_TOKENS) return Array.from(tokens);
    }
  }
  return Array.from(tokens);
};
