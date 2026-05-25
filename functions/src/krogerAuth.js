"use strict";

const crypto = require("node:crypto");
const { FieldValue } = require("firebase-admin/firestore");
const {
  KROGER_API_BASE_URL,
  KROGER_REDIRECT_URI,
  KROGER_APP_DEEP_LINK,
  KROGER_SESSION_COLLECTION,
  KROGER_TOKEN_SKEW_MS,
} = require("./config");

function getUserKrogerDoc(db, uid) {
  return db.collection("users").doc(uid).collection("private").doc("kroger");
}

function getSessionDoc(db, state) {
  return db.collection(KROGER_SESSION_COLLECTION).doc(state);
}

function buildKrogerAuthorizeUrl({ clientId, state, scope }) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: KROGER_REDIRECT_URI,
    scope,
    state,
  });

  return `${KROGER_API_BASE_URL}/v1/connect/oauth2/authorize?${params.toString()}`;
}

function buildAppRedirect({ status, state, message }) {
  const url = new URL(KROGER_APP_DEEP_LINK);
  url.searchParams.set("status", status);
  if (state) {
    url.searchParams.set("state", state);
  }
  if (message) {
    url.searchParams.set("message", message);
  }
  return url.toString();
}

function createState() {
  return crypto.randomBytes(24).toString("hex");
}

function normalizeTokenResponse(tokenResponse) {
  const now = Date.now();
  const expiresInSeconds = Number(tokenResponse.expires_in || 1800);

  return {
    accessToken: tokenResponse.access_token,
    refreshToken: tokenResponse.refresh_token || null,
    tokenType: tokenResponse.token_type || "Bearer",
    scope: tokenResponse.scope || "",
    expiresAt: new Date(now + expiresInSeconds * 1000).toISOString(),
    expiresInSeconds,
    idToken: tokenResponse.id_token || null,
  };
}

function extractCookieHeader(response) {
  if (typeof response.headers?.getSetCookie === "function") {
    const cookieValues = response.headers
      .getSetCookie()
      .map((value) => value.split(";")[0])
      .filter(Boolean);

    if (cookieValues.length) {
      return cookieValues.join("; ");
    }
  }

  const setCookieHeader = response.headers?.get("set-cookie");

  if (!setCookieHeader) {
    return "";
  }

  return setCookieHeader
    .split(/,(?=[^;]+?=)/)
    .map((value) => value.split(";")[0].trim())
    .filter(Boolean)
    .join("; ");
}

async function exchangeToken({
  clientId,
  clientSecret,
  body,
}) {
  const headers = {
    Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
  };

  const response = await fetch(`${KROGER_API_BASE_URL}/v1/connect/oauth2/token`, {
    method: "POST",
    headers,
    body: new URLSearchParams(body).toString(),
  });

  const text = await response.text();
  let data;

  try {
    data = text ? JSON.parse(text) : {};
  } catch (error) {
    data = { raw: text };
  }

  if (!response.ok) {
    const message = data?.error_description || data?.message || "Kroger token exchange failed";
    const tokenError = new Error(message);
    tokenError.status = response.status;
    tokenError.payload = data;
    throw tokenError;
  }

  return {
    ...normalizeTokenResponse(data),
    cookieHeader: extractCookieHeader(response),
  };
}

async function exchangeAuthorizationCode({
  clientId,
  clientSecret,
  code,
}) {
  return exchangeToken({
    clientId,
    clientSecret,
    body: {
      grant_type: "authorization_code",
      code,
      redirect_uri: KROGER_REDIRECT_URI,
    },
  });
}

async function refreshAccessToken({
  clientId,
  clientSecret,
  refreshToken,
}) {
  return exchangeToken({
    clientId,
    clientSecret,
    body: {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    },
  });
}

async function fetchAppAccessToken({
  clientId,
  clientSecret,
  scope = "",
}) {
  return exchangeToken({
    clientId,
    clientSecret,
    body: {
      grant_type: "client_credentials",
      scope,
    },
  });
}

function isTokenExpired(tokenData) {
  if (!tokenData?.expiresAt) {
    return true;
  }

  return new Date(tokenData.expiresAt).getTime() - KROGER_TOKEN_SKEW_MS <= Date.now();
}

async function saveUserTokens(db, uid, tokenData, extras = {}) {
  const ref = getUserKrogerDoc(db, uid);

  await ref.set(
    {
      ...tokenData,
      connected: true,
      updatedAt: FieldValue.serverTimestamp(),
      lastAuthAt: FieldValue.serverTimestamp(),
      ...extras,
    },
    { merge: true },
  );

  const snapshot = await ref.get();
  return snapshot.data();
}

async function getUserTokenRecord(db, uid) {
  const snapshot = await getUserKrogerDoc(db, uid).get();
  return snapshot.exists ? snapshot.data() : null;
}

async function saveSelectedStore(db, uid, store) {
  const ref = getUserKrogerDoc(db, uid);
  await ref.set(
    {
      selectedStore: store || null,
      selectedStoreUpdatedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  const snapshot = await ref.get();
  return snapshot.exists ? snapshot.data() : null;
}

async function disconnectKrogerAccount(db, uid) {
  await getUserKrogerDoc(db, uid).delete();
}

async function ensureFreshUserToken({
  db,
  uid,
  clientId,
  clientSecret,
  forceRefresh = false,
}) {
  const existing = await getUserTokenRecord(db, uid);

  if (!existing?.accessToken) {
    const error = new Error("Kroger account is not connected");
    error.code = "not-connected";
    throw error;
  }

  if (!forceRefresh && !isTokenExpired(existing)) {
    return existing;
  }

  if (!existing.refreshToken) {
    const error = new Error("Kroger session expired. Reconnect is required.");
    error.code = "reauth-required";
    throw error;
  }

  try {
    const refreshed = await refreshAccessToken({
      clientId,
      clientSecret,
      refreshToken: existing.refreshToken,
    });

    return saveUserTokens(db, uid, {
      ...refreshed,
      refreshToken: refreshed.refreshToken || existing.refreshToken,
    });
  } catch (error) {
    await getUserKrogerDoc(db, uid).set(
      {
        connected: false,
        lastRefreshError: error.message,
        refreshFailedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    error.code = error.code || "reauth-required";
    throw error;
  }
}

async function createAuthSession({
  db,
  uid,
  clientId,
  scope,
}) {
  const state = createState();
  const authorizeUrl = buildKrogerAuthorizeUrl({
    clientId,
    state,
    scope,
  });

  await getSessionDoc(db, state).set({
    uid,
    state,
    scope,
    authorizeUrl,
    status: "pending",
    createdAt: FieldValue.serverTimestamp(),
  });

  return { state, authorizeUrl };
}

async function completeAuthSession({
  db,
  state,
  code,
  clientId,
  clientSecret,
}) {
  const sessionRef = getSessionDoc(db, state);
  const sessionSnapshot = await sessionRef.get();

  if (!sessionSnapshot.exists) {
    const error = new Error("OAuth state is invalid or expired");
    error.code = "invalid-state";
    throw error;
  }

  const session = sessionSnapshot.data();
  const tokenData = await exchangeAuthorizationCode({
    clientId,
    clientSecret,
    code,
  });

  await saveUserTokens(db, session.uid, tokenData, {
    state,
    scope: session.scope,
  });

  await sessionRef.set(
    {
      status: "completed",
      completedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return {
    uid: session.uid,
    redirectUrl: buildAppRedirect({ status: "success", state }),
  };
}

async function failAuthSession({
  db,
  state,
  message,
}) {
  if (state) {
    await getSessionDoc(db, state).set(
      {
        status: "failed",
        error: message,
        failedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  }

  return buildAppRedirect({
    status: "error",
    state,
    message,
  });
}

module.exports = {
  buildAppRedirect,
  completeAuthSession,
  createAuthSession,
  ensureFreshUserToken,
  failAuthSession,
  fetchAppAccessToken,
  getUserKrogerDoc,
  getUserTokenRecord,
  isTokenExpired,
  refreshAccessToken,
  saveSelectedStore,
  saveUserTokens,
  disconnectKrogerAccount,
};
