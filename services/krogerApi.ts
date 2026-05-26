import { auth, functions } from "@/services/firebase";
import { waitForAuthInitialized } from "@/services/waitForAuth";
import * as WebBrowser from "expo-web-browser";
import { httpsCallable } from "firebase/functions";

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

export async function connectKrogerAccount(scope?: string) {
  const session = await createKrogerAuthSession(scope);
  return WebBrowser.openAuthSessionAsync(
    session.authorizeUrl,
    "mealcartrnmain://screens/KrogerSignupScreen",
  );
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
  const url = new URL(`https://api-ce.kroger.com${path}`);

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

export async function addItemsToKrogerCart(items: unknown[]) {
  await ensureSignedIn();

  // Get the user's OAuth token from the cloud function
  const tokenResult = await getKrogerUserTokenCallable();
  const { accessToken } = tokenResult.data;

  // Call Kroger directly from the client to avoid CDN blocking cloud function IPs
  const response = await fetch("https://api-ce.kroger.com/v1/cart/add", {
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

  if (!response.ok) {
    const err: any = new Error(`Kroger cart API failed (${response.status})`);
    err.status = response.status;
    err.details = payload;
    throw err;
  }

  return payload;
}
