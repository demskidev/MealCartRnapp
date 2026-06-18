"use strict";

const FIREBASE_PROJECT_ID = "mealcart-5d62b";
const FIREBASE_FUNCTIONS_REGION = "us-central1";
const KROGER_API_BASE_URL = "https://api.kroger.com";
const KROGER_REDIRECT_URI = `https://${FIREBASE_PROJECT_ID}.web.app/kroger/callback`;
const KROGER_APP_DEEP_LINK = "mealcartrnmain://screens/KrogerSignupScreen";
const KROGER_SESSION_COLLECTION = "krogerAuthSessions";
const KROGER_TOKEN_SKEW_MS = 60 * 1000;
const KROGER_ALLOWED_USER_PREFIXES = ["/v1/cart"];

module.exports = {
  FIREBASE_PROJECT_ID,
  FIREBASE_FUNCTIONS_REGION,
  KROGER_API_BASE_URL,
  KROGER_REDIRECT_URI,
  KROGER_APP_DEEP_LINK,
  KROGER_SESSION_COLLECTION,
  KROGER_TOKEN_SKEW_MS,
  KROGER_ALLOWED_USER_PREFIXES,
};
