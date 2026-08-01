/**
 * Date display helpers.
 *
 * The app shows dates in two shapes:
 *  - long form ("October 2, 2025"), produced inline with
 *    `toLocaleDateString("en-US", { month: "long", ... })`
 *  - numeric slash form, which is **always MM/DD/YYYY** — use `formatSlashDate`
 *    rather than hand-rolling it, so the field order can't drift between screens.
 */

/**
 * Accepts what the app actually stores: a JS `Date`, a Firestore `Timestamp`
 * (`toDate()`), a `{ seconds }` shape, an ISO string, or an epoch number.
 */
export const toDate = (value: any): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value.toDate === "function") return value.toDate();
  if (value.seconds != null) return new Date(value.seconds * 1000);

  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * Zero-padded US numeric date: `MM/DD/YYYY`.
 *
 * Returns "" for anything unparseable, matching how the callers already treat a
 * missing date.
 */
export const formatSlashDate = (value: any): string => {
  const date = toDate(value);
  if (!date) return "";

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${month}/${day}/${date.getFullYear()}`;
};
