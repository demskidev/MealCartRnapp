"use strict";

const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const logger = require("firebase-functions/logger");
const { defineSecret } = require("firebase-functions/params");
const {
  HttpsError,
  onCall,
  onRequest,
} = require("firebase-functions/v2/https");
const { FIREBASE_FUNCTIONS_REGION, FIREBASE_PROJECT_ID } = require("./config");
const { callKrogerApi } = require("./krogerApi");
const {
  completeAuthSession,
  createAuthSession,
  disconnectKrogerAccount,
  ensureFreshUserToken,
  failAuthSession,
  fetchAppAccessToken,
  getUserTokenRecord,
  isTokenExpired,
  saveSelectedStore,
} = require("./krogerAuth");

initializeApp();

const db = getFirestore();
const krogerClientId = defineSecret("KROGER_CLIENT_ID");
const krogerClientSecret = defineSecret("KROGER_CLIENT_SECRET");

function respondWithAppRedirect(response, redirectUrl) {
  const escapedHref = String(redirectUrl)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

  response.set("Cache-Control", "no-store");
  response.status(200).send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Returning to Meal Cart…</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; padding: 24px; line-height: 1.4;">
    <p>Returning to Meal Cart…</p>
    <p>If the app does not open automatically, tap below:</p>
    <p><a href="${escapedHref}">Open Meal Cart</a></p>
    <script>
      window.location.replace(${JSON.stringify(redirectUrl)});
    </script>
  </body>
</html>`);
}

logger.info("Initializing Kroger functions", {
  projectId: FIREBASE_PROJECT_ID,
  region: FIREBASE_FUNCTIONS_REGION,
});

exports.createKrogerAuthSession = onCall(
  {
    region: FIREBASE_FUNCTIONS_REGION,
    secrets: [krogerClientId],
  },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError("unauthenticated", "You must be signed in.");
    }

    const scope =
      typeof request.data?.scope === "string" && request.data.scope.trim()
        ? request.data.scope.trim()
        : "cart.basic:write";

    const session = await createAuthSession({
      db,
      uid: request.auth.uid,
      clientId: krogerClientId.value(),
      scope,
    });

    return session;
  },
);

exports.getKrogerConnectionStatus = onCall(
  {
    region: FIREBASE_FUNCTIONS_REGION,
    secrets: [krogerClientId, krogerClientSecret],
  },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError("unauthenticated", "You must be signed in.");
    }

    let tokenRecord = await getUserTokenRecord(db, request.auth.uid);
    let connected = Boolean(tokenRecord?.connected && tokenRecord?.accessToken);

    if (connected && tokenRecord && isTokenExpired(tokenRecord)) {
      if (tokenRecord.refreshToken) {
        try {
          tokenRecord = await ensureFreshUserToken({
            db,
            uid: request.auth.uid,
            clientId: krogerClientId.value(),
            clientSecret: krogerClientSecret.value(),
          });
          connected = true;
        } catch (error) {
          connected = false;
        }
      } else {
        connected = false;
      }
    }

    return {
      connected,
      expiresAt: tokenRecord?.expiresAt || null,
      scope: tokenRecord?.scope || null,
      updatedAt: tokenRecord?.updatedAt || null,
      lastRefreshError: tokenRecord?.lastRefreshError || null,
      selectedStore: tokenRecord?.selectedStore || null,
    };
  },
);

exports.saveKrogerSelectedStore = onCall(
  {
    region: FIREBASE_FUNCTIONS_REGION,
  },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError("unauthenticated", "You must be signed in.");
    }

    const store = request.data?.store;

    if (!store || typeof store !== "object") {
      throw new HttpsError("invalid-argument", "A Kroger store is required.");
    }

    const result = await saveSelectedStore(db, request.auth.uid, store);

    return {
      selectedStore: result?.selectedStore || null,
      updatedAt: result?.selectedStoreUpdatedAt || null,
    };
  },
);

exports.disconnectKrogerAccount = onCall(
  {
    region: FIREBASE_FUNCTIONS_REGION,
  },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError("unauthenticated", "You must be signed in.");
    }

    await disconnectKrogerAccount(db, request.auth.uid);

    return { success: true };
  },
);

exports.getKrogerAppToken = onCall(
  {
    region: FIREBASE_FUNCTIONS_REGION,
    secrets: [krogerClientId, krogerClientSecret],
  },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError("unauthenticated", "You must be signed in.");
    }

    const scope =
      typeof request.data?.scope === "string" ? request.data.scope.trim() : "";

    try {
      const appToken = await fetchAppAccessToken({
        clientId: krogerClientId.value(),
        clientSecret: krogerClientSecret.value(),
        scope,
      });

      return {
        accessToken: appToken.accessToken,
        expiresAt: appToken.expiresAt,
        expiresInSeconds: appToken.expiresInSeconds,
        scope: appToken.scope,
        tokenType: appToken.tokenType,
      };
    } catch (error) {
      logger.error("getKrogerAppToken failed", error);
      throw new HttpsError(
        "internal",
        error.message || "Unable to get Kroger app token",
      );
    }
  },
);

exports.getKrogerUserToken = onCall(
  {
    region: FIREBASE_FUNCTIONS_REGION,
    secrets: [krogerClientId, krogerClientSecret],
  },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError("unauthenticated", "You must be signed in.");
    }

    try {
      const tokenData = await ensureFreshUserToken({
        db,
        uid: request.auth.uid,
        clientId: krogerClientId.value(),
        clientSecret: krogerClientSecret.value(),
      });

      return {
        accessToken: tokenData.accessToken,
        expiresAt: tokenData.expiresAt,
        scope: tokenData.scope || "",
      };
    } catch (error) {
      logger.error("getKrogerUserToken failed", error);

      if (error.code === "not-connected" || error.code === "reauth-required") {
        throw new HttpsError("unauthenticated", error.message);
      }

      throw new HttpsError(
        "internal",
        error.message || "Unable to get Kroger user token",
      );
    }
  },
);

exports.krogerProxy = onCall(
  {
    region: FIREBASE_FUNCTIONS_REGION,
    secrets: [krogerClientId, krogerClientSecret],
  },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError("unauthenticated", "You must be signed in.");
    }

    const { path, method, query, body } = request.data || {};

    if (typeof path !== "string" || !path.startsWith("/")) {
      throw new HttpsError(
        "invalid-argument",
        "A valid Kroger API path is required.",
      );
    }

    try {
      const tokenRecord = await getUserTokenRecord(db, request.auth.uid);
      logger.info("krogerProxy token info", {
        scope: tokenRecord?.scope || "none",
        connected: tokenRecord?.connected || false,
        expiresAt: tokenRecord?.expiresAt || "unknown",
      });

      const result = await callKrogerApi({
        db,
        uid: request.auth.uid,
        clientId: krogerClientId.value(),
        clientSecret: krogerClientSecret.value(),
        path,
        method,
        query,
        body,
      });

      if (!result.ok) {
        logger.error("krogerProxy Kroger API error", {
          status: result.status,
          path,
          method,
          payload: result.payload,
        });

        throw new HttpsError(
          result.status === 401 ? "unauthenticated" : "failed-precondition",
          result.payload?.message || `Kroger API error ${result.status}`,
          {
            status: result.status,
            payload: result.payload,
          },
        );
      }

      return result.payload;
    } catch (error) {
      logger.error("krogerProxy failed", {
        message: error.message,
        code: error.code,
        details: error.details,
      });

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError(
        error.code === "reauth-required" ? "unauthenticated" : "internal",
        error.message || "Kroger API request failed",
      );
    }
  },
);

exports.krogerOAuthCallback = onRequest(
  {
    region: FIREBASE_FUNCTIONS_REGION,
    secrets: [krogerClientId, krogerClientSecret],
  },
  async (request, response) => {
    const state =
      typeof request.query.state === "string" ? request.query.state : "";
    const code =
      typeof request.query.code === "string" ? request.query.code : "";
    const oauthError =
      typeof request.query.error === "string" ? request.query.error : "";
    const errorDescription =
      typeof request.query.error_description === "string"
        ? request.query.error_description
        : "";

    try {
      if (oauthError) {
        const redirectUrl = await failAuthSession({
          db,
          state,
          message: errorDescription || oauthError,
        });
        respondWithAppRedirect(response, redirectUrl);
        return;
      }

      if (!code || !state) {
        throw new Error("Missing OAuth code or state.");
      }

      const result = await completeAuthSession({
        db,
        state,
        code,
        clientId: krogerClientId.value(),
        clientSecret: krogerClientSecret.value(),
      });

      respondWithAppRedirect(response, result.redirectUrl);
    } catch (error) {
      logger.error("krogerOAuthCallback failed", error);
      const redirectUrl = await failAuthSession({
        db,
        state,
        message: error.message || "Kroger sign-in failed",
      });
      respondWithAppRedirect(response, redirectUrl);
    }
  },
);
