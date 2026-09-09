import { auth, functions } from "@/services/firebase";
import { waitForAuthInitialized } from "@/services/waitForAuth";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { httpsCallable } from "firebase/functions";

const KROGER_API_BASE_URL = "https://api.kroger.com";

type KrogerAuthSession = any;

type KrogerConnectionStatus = any;

type KrogerAppToken = any;

type KrogerProxyParams = {
  path: string;
  method?: string;
  query?: Record<string, string | number | boolean | null | undefined>;
  body?: unknown;
  authMode?: "app" | "user";
};

const createAuthSessionCallable = httpsCallable<
  { scope?: string },
  KrogerAuthSession
>(functions, "createKrogerAuthSession");

const getConnectionStatusCallable = httpsCallable<void, KrogerConnectionStatus>(
  functions,
  "getKrogerConnectionStatus",
);

const saveKrogerSelectedStoreCallable = httpsCallable<{ store: any }, any>(
  functions,
  "saveKrogerSelectedStore",
);

const disconnectKrogerAccountCallable = httpsCallable<
  void,
  { success: boolean }
>(functions, "disconnectKrogerAccount");

const getKrogerAppTokenCallable = httpsCallable<
  { scope?: string },
  KrogerAppToken
>(functions, "getKrogerAppToken");

const krogerProxyCallable = httpsCallable<KrogerProxyParams, unknown>(
  functions,
  "krogerProxy",
);

const logKrogerCartAttemptCallable = httpsCallable<
  Record<string, unknown>,
  { logged: boolean }
>(functions, "logKrogerCartAttempt");

const getKrogerUserTokenCallable = httpsCallable<
  void,
  { accessToken: string; expiresAt: string; scope: string }
>(functions, "getKrogerUserToken");

type CachedAppToken = {
  accessToken: string;
  expiresAtMs: number;
  scope: string;
  tokenType: string;
};

let cachedAppToken: CachedAppToken | null = null;

async function ensureSignedIn() {
  if (!auth.currentUser) {
    await waitForAuthInitialized();
  }

  if (!auth.currentUser) {
    throw new Error("You must be signed in to connect Kroger.");
  }
}

async function createKrogerAuthSession(scope?: string) {
  await ensureSignedIn();
  const result = await createAuthSessionCallable(scope ? { scope } : {});
  return result.data;
}

const KROGER_REDIRECT_URL = "mealcartrnmain://screens/KrogerSignupScreen";

export type KrogerConnectOutcome =
  /** User backed out of the Kroger web flow. */
  | { outcome: "cancelled" }
  /** Kroger redirected back reporting success — verify with the status call. */
  | { outcome: "returned" }
  /** Kroger (or our callback function) reported a failure. */
  | { outcome: "failed"; message?: string }
  /** Session ended without a readable redirect; re-check the status. */
  | { outcome: "unknown" };

/**
 * Reads the `?status=`/`?message=` our Hosting callback appends to the deep link
 * out of the auth-session result.
 *
 * This has to come from the returned url, not from router params: on iOS
 * `openAuthSessionAsync` uses ASWebAuthenticationSession, which intercepts the
 * `mealcartrnmain://` callback itself, so the redirect never reaches expo-router
 * and no `status` param is ever delivered to the screen.
 */
const readAuthSessionRedirect = (
  result: WebBrowser.WebBrowserAuthSessionResult,
): KrogerConnectOutcome => {
  if (result.type === "cancel" || result.type === "dismiss") {
    return { outcome: "cancelled" };
  }

  const url =
    "url" in result && typeof result.url === "string" ? result.url : "";

  if (!url) {
    return { outcome: "unknown" };
  }

  const { queryParams } = Linking.parse(url);
  const status =
    typeof queryParams?.status === "string" ? queryParams.status : "";
  const message =
    typeof queryParams?.message === "string" ? queryParams.message : undefined;

  if (status === "success") {
    return { outcome: "returned" };
  }

  if (status === "error") {
    return { outcome: "failed", message };
  }

  return { outcome: "unknown" };
};

export async function connectKrogerAccount(scope?: string) {
  const session = await createKrogerAuthSession(scope);
  const result = await WebBrowser.openAuthSessionAsync(
    session.authorizeUrl,
    KROGER_REDIRECT_URL,
  );

  return readAuthSessionRedirect(result);
}

export async function getKrogerConnectionStatus() {
  await ensureSignedIn();
  const result = await getConnectionStatusCallable();
  return result.data;
}

export async function saveKrogerSelectedStore(store: any) {
  await ensureSignedIn();
  const result = await saveKrogerSelectedStoreCallable({ store });
  return result.data;
}

export async function disconnectKrogerAccount() {
  await ensureSignedIn();
  cachedAppToken = null;
  const result = await disconnectKrogerAccountCallable();
  return result.data;
}

async function callKrogerApi<T = unknown>(params: KrogerProxyParams) {
  await ensureSignedIn();
  console.log(
    "[Kroger API] Calling proxy with params:",
    JSON.stringify(params),
  );

  try {
    const result = await krogerProxyCallable(params);
    return result.data as T;
  } catch (error: any) {
    console.log("[Kroger API] Proxy error code:", error?.code);
    console.log("[Kroger API] Proxy error message:", error?.message);
    console.log(
      "[Kroger API] Proxy error details:",
      JSON.stringify(error?.details),
    );
    throw error;
  }
}

async function getKrogerAppToken(scope = "") {
  await ensureSignedIn();

  const now = Date.now();
  if (
    cachedAppToken &&
    cachedAppToken.scope === scope &&
    cachedAppToken.expiresAtMs - 60_000 > now
  ) {
    return cachedAppToken;
  }

  const result = await getKrogerAppTokenCallable(scope ? { scope } : {});
  const data = result.data;

  cachedAppToken = {
    accessToken: data.accessToken,
    expiresAtMs: new Date(data.expiresAt).getTime(),
    scope: data.scope || scope,
    tokenType: data.tokenType,
  };

  return cachedAppToken;
}

async function callKrogerReadApi<T = unknown>({
  path,
  query,
  scope = "",
}: {
  path: string;
  query?: Record<string, string | number | boolean | null | undefined>;
  scope?: string;
}) {
  const token = await getKrogerAppToken(scope);
  const url = new URL(`${KROGER_API_BASE_URL}${path}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token.accessToken}`,
      Accept: "application/json",
      "Cache-Control": "no-cache",
    },
  });

  const text = await response.text();
  let payload: unknown;

  try {
    payload = text ? JSON.parse(text) : {};
  } catch (error) {
    payload = { raw: text };
  }

  if (!response.ok) {
    const requestError: any = new Error("Kroger read API request failed");
    requestError.status = response.status;
    requestError.details = payload;
    throw requestError;
  }

  return payload as T;
}

export async function searchKrogerStores(zipCode: string) {
  return callKrogerReadApi({
    path: "/v1/locations",
    query: {
      "filter.zipCode.near": zipCode,
    },
  });
}

export async function searchKrogerProducts(
  term: string | undefined,
  locationId: string,
  limit = 20,
) {
  const query: Record<string, string | number> = {
    "filter.locationId": locationId,
    "filter.limit": limit,
  };
  if (term) {
    query["filter.term"] = term;
  }
  return callKrogerReadApi({
    path: "/v1/products",
    scope: "product.compact",
    query,
  });
}

export async function fetchKrogerProductById(
  productId: string,
  locationId: string,
) {
  return callKrogerReadApi({
    path: "/v1/products",
    scope: "product.compact",
    query: {
      "filter.productId": productId,
      "filter.locationId": locationId,
    },
  });
}

export async function getKrogerCart() {
  await ensureSignedIn();

  const tokenResult = await getKrogerUserTokenCallable();
  const { accessToken } = tokenResult.data;

  const response = await fetch(`${KROGER_API_BASE_URL}/v1/cart`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  const text = await response.text();
  let payload: unknown;

  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { raw: text };
  }

  if (!response.ok) {
    const err: any = new Error(`Kroger cart read failed (${response.status})`);
    err.status = response.status;
    err.details = payload;
    throw err;
  }

  return payload;
}

/**
 * Reports the outcome of a cart add to Cloud Logging.
 *
 * The cart write is the one Kroger call that does not go through a function
 * (Kroger's CDN blocks GCP egress), so nothing about it is recoverable from
 * `firebase functions:log` — a user reporting "it doesn't send to my cart" left
 * no server-side trace at all. This posts just the outcome, never the token.
 * It is best-effort: a diagnostics failure must never fail a cart add.
 */
async function reportKrogerCartAttempt(diagnostic: Record<string, unknown>) {
  try {
    await logKrogerCartAttemptCallable(diagnostic);
  } catch {
    // Diagnostics only — swallow.
  }
}

export type KrogerCartItem = {
  upc: string;
  quantity: number;
  modality?: string;
};

export type KrogerCartRejection = {
  upc: string;
  status?: number;
  reason?: string;
};

export type KrogerCartResult = {
  addedUpcs: string[];
  rejected: KrogerCartRejection[];
};

/** Statuses that describe the request as a whole, not an individual item. */
const isWholeRequestFailure = (status: number) =>
  status === 401 || status === 403 || status === 429 || status >= 500;

const describeKrogerError = (payload: any): string => {
  const first = payload?.errors?.[0] || payload?.error || payload;

  if (typeof first === "string") return first;

  return (
    first?.reason ||
    first?.detail ||
    first?.message ||
    first?.error_description ||
    JSON.stringify(payload ?? {})
  );
};

async function putCartAdd(accessToken: string, items: KrogerCartItem[]) {
  // Call Kroger directly from the client to avoid CDN blocking cloud function IPs
  const response = await fetch(`${KROGER_API_BASE_URL}/v1/cart/add`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ items }),
  });

  const text = await response.text();
  let payload: unknown;

  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { raw: text };
  }

  return { ok: response.ok, status: response.status, payload };
}

/**
 * Adds items to the signed-in user's Kroger cart.
 *
 * Kroger validates `PUT /v1/cart/add` as a single unit: if it rejects any one
 * item (a UPC the user's store does not carry, say) it fails the whole request
 * and nothing reaches the cart. That is indistinguishable, from the outside,
 * from "the integration is broken" — which is how it was reported. So a failed
 * batch is retried one item at a time: the items Kroger accepts land in the
 * cart, and the ones it refuses come back named in `rejected`.
 *
 * The per-item retry only runs for item-level rejections. A 401/403/429/5xx is
 * about the request as a whole, so it is thrown straight through rather than
 * repeated once per item.
 */
export async function addItemsToKrogerCart(
  items: KrogerCartItem[],
): Promise<KrogerCartResult> {
  await ensureSignedIn();

  // Get the user's OAuth token from the cloud function
  const tokenResult = await getKrogerUserTokenCallable();
  const { accessToken, scope } = tokenResult.data;

  const batch = await putCartAdd(accessToken, items);

  if (batch.ok) {
    void reportKrogerCartAttempt({
      outcome: "batch-ok",
      scope,
      itemCount: items.length,
    });
    return { addedUpcs: items.map((item) => item.upc), rejected: [] };
  }

  if (isWholeRequestFailure(batch.status)) {
    void reportKrogerCartAttempt({
      outcome: "request-failed",
      scope,
      itemCount: items.length,
      status: batch.status,
      reason: describeKrogerError(batch.payload),
    });

    const err: any = new Error(`Kroger cart API failed (${batch.status})`);
    err.status = batch.status;
    err.details = batch.payload;
    throw err;
  }

  const addedUpcs: string[] = [];
  const rejected: KrogerCartRejection[] = [];

  for (const item of items) {
    const single = await putCartAdd(accessToken, [item]);

    if (single.ok) {
      addedUpcs.push(item.upc);
    } else {
      rejected.push({
        upc: item.upc,
        status: single.status,
        reason: describeKrogerError(single.payload),
      });
    }
  }

  void reportKrogerCartAttempt({
    outcome: addedUpcs.length ? "partial" : "all-rejected",
    scope,
    itemCount: items.length,
    status: batch.status,
    addedCount: addedUpcs.length,
    rejected,
  });

  if (addedUpcs.length === 0) {
    const err: any = new Error(`Kroger cart API failed (${batch.status})`);
    err.status = batch.status;
    err.details = batch.payload;
    err.rejected = rejected;
    throw err;
  }

  return { addedUpcs, rejected };
}
