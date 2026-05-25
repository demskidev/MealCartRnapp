"use strict";

const {
  KROGER_API_BASE_URL,
  KROGER_ALLOWED_USER_PREFIXES,
} = require("./config");
const { ensureFreshUserToken } = require("./krogerAuth");

function assertAllowedPath(path, allowedPrefixes) {
  if (!path || typeof path !== "string") {
    throw new Error("A Kroger API path is required");
  }

  const allowed = allowedPrefixes.some((prefix) => path.startsWith(prefix));
  if (!allowed) {
    throw new Error(`Path "${path}" is not allowed`);
  }
}

function appendQuery(path, query) {
  const url = new URL(`${KROGER_API_BASE_URL}${path}`);

  if (query && typeof query === "object") {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url;
}

async function makeKrogerRequest({
  accessToken,
  method,
  path,
  query,
  body,
}) {
  const url = appendQuery(path, query);
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
    "Cache-Control": "no-cache",
    "User-Agent": "MealCartFirebaseFunctions/1.0",
  };

  const options = {
    method: method || "GET",
    headers,
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const text = await response.text();
  let payload;

  try {
    payload = text ? JSON.parse(text) : {};
  } catch (error) {
    payload = { raw: text };
  }

  return {
    ok: response.ok,
    status: response.status,
    payload,
  };
}

async function callKrogerApi({
  db,
  uid,
  clientId,
  clientSecret,
  path,
  method,
  query,
  body,
}) {
  assertAllowedPath(path, KROGER_ALLOWED_USER_PREFIXES);

  let userToken = await ensureFreshUserToken({
    clientId,
    clientSecret,
    db,
    uid,
  });

  let result = await makeKrogerRequest({
    accessToken: userToken.accessToken,
    method,
    path,
    query,
    body,
  });

  if (result.status === 401 && userToken.refreshToken) {
    userToken = await ensureFreshUserToken({
      db,
      uid,
      clientId,
      clientSecret,
      forceRefresh: true,
    });

    result = await makeKrogerRequest({
      accessToken: userToken.accessToken,
      method,
      path,
      query,
      body,
    });
  }

  return result;
}

module.exports = {
  callKrogerApi,
};
