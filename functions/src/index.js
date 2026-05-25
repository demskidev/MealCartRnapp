"use strict";

const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const logger = require("firebase-functions/logger");
const { defineSecret } = require("firebase-functions/params");
const { HttpsError, onCall, onRequest } = require("firebase-functions/v2/https");
const {
  FIREBASE_FUNCTIONS_REGION,
  FIREBASE_PROJECT_ID,
} = require("./config");
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
      throw new HttpsError("internal", error.message || "Unable to get Kroger app token");
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
      throw new HttpsError("invalid-argument", "A valid Kroger API path is required.");
    }

    try {
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
        throw new HttpsError(
          result.status === 401 ? "unauthenticated" : "failed-precondition",
          result.payload?.message || "Kroger API request failed",
          {
            status: result.status,
            payload: result.payload,
          },
        );
      }

      return result.payload;
    } catch (error) {
      logger.error("krogerProxy failed", error);

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
    const state = typeof request.query.state === "string" ? request.query.state : "";
    const code = typeof request.query.code === "string" ? request.query.code : "";
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
        response.redirect(302, redirectUrl);
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

      response.redirect(302, result.redirectUrl);
    } catch (error) {
      logger.error("krogerOAuthCallback failed", error);
      const redirectUrl = await failAuthSession({
        db,
        state,
        message: error.message || "Kroger sign-in failed",
      });
      response.redirect(302, redirectUrl);
    }
  },
);
