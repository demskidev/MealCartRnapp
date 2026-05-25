# Kroger Firebase file map

This document explains why each Kroger/Firebase file was added and what it is used for.

## Redirect URL

Expected redirect URI for the Firebase project in this repo:

`https://mealcart-5d62b.web.app/kroger/callback`

This is the correct Firebase Hosting URL format for project id `mealcart-5d62b`.

Important:

- The URL format is correct based on the Firebase project id in `services/firebase.js`.
- The URL will work only after Firebase Hosting is enabled for that project and `firebase deploy --only functions,hosting` has been run.
- The `/kroger/callback` path works because of the Hosting rewrite in `firebase.json`.

## File usage

### `/Users/r/Documents/ReactNativeProjects/MealCartRnapp/firebase.json`

Defines Firebase Hosting and Cloud Functions behavior.

Used for:
- registering the `functions` source folder
- rewriting `/kroger/callback` requests to the `krogerOAuthCallback` Cloud Function

Why it matters:
- this is what makes the Kroger redirect URL point to your backend logic instead of a static page

### `/Users/r/Documents/ReactNativeProjects/MealCartRnapp/hosting/index.html`

Simple placeholder file for Firebase Hosting.

Used for:
- satisfying Firebase Hosting's need for a public directory
- giving the site a minimal default page if someone opens the base hosting URL

Why it matters:
- the Kroger callback itself does not use this file
- the actual callback is handled by the rewrite in `firebase.json`

### `/Users/r/Documents/ReactNativeProjects/MealCartRnapp/functions/package.json`

Defines the Cloud Functions Node project.

Used for:
- installing `firebase-admin` and `firebase-functions`
- deployable Functions runtime configuration

### `/Users/r/Documents/ReactNativeProjects/MealCartRnapp/functions/src/config.js`

Central config/constants file for the Kroger integration.

Used for:
- Kroger API base URL
- redirect URI
- app deep link
- allowed API path prefixes
- token expiry safety window

### `/Users/r/Documents/ReactNativeProjects/MealCartRnapp/functions/src/krogerAuth.js`

Auth and token management helpers.

Used for:
- creating OAuth `state`
- building the Kroger authorize URL
- exchanging auth code for tokens
- refreshing tokens
- storing Kroger tokens in Firestore
- checking whether a token is expired

### `/Users/r/Documents/ReactNativeProjects/MealCartRnapp/functions/src/krogerApi.js`

Server-side Kroger request wrapper.

Used for:
- making Kroger API calls
- selecting app-token vs user-token mode
- forcing safe path restrictions
- retrying user-token calls after refresh when needed

### `/Users/r/Documents/ReactNativeProjects/MealCartRnapp/functions/src/index.js`

Main Cloud Functions entry point.

Used for:
- `createKrogerAuthSession`
- `getKrogerConnectionStatus`
- `krogerProxy`
- `krogerOAuthCallback`

Why it matters:
- this is the actual backend interface your app will call

### `/Users/r/Documents/ReactNativeProjects/MealCartRnapp/services/firebase.js`

Existing Firebase client setup, extended to include Functions.

Used for:
- exporting `functions` so the app can call Cloud Functions

### `/Users/r/Documents/ReactNativeProjects/MealCartRnapp/services/krogerApi.ts`

Frontend helper for Kroger-related actions.

Used for:
- starting Kroger login with `connectKrogerAccount()`
- checking Kroger connection status
- calling store/product/cart flows through Firebase

Why it matters:
- keeps Kroger API usage out of UI components
- prevents secrets from being exposed in the mobile app

### `/Users/r/Documents/ReactNativeProjects/MealCartRnapp/docs/kroger-firebase-setup.md`

Setup and deployment instructions.

Used for:
- secrets setup
- deployment command reference
- high-level request flow

## Why the HTML file exists

The HTML file is not the Kroger callback handler.

Firebase Hosting expects a public directory for hosted content. I added a very small `hosting/index.html` so Hosting has a valid static root. When Kroger redirects to `/kroger/callback`, Firebase does not serve that HTML file. Instead, Firebase reads `firebase.json` and rewrites `/kroger/callback` to the `krogerOAuthCallback` Cloud Function.

So:

- `hosting/index.html` is only a placeholder/default page
- `/kroger/callback` is handled by the Cloud Function

## Double-check on redirect URL validity

What is confirmed from this repo:

- Firebase project id is `mealcart-5d62b`
- default Firebase Hosting domain format is `https://<project-id>.web.app`
- callback path configured in this repo is `/kroger/callback`

Therefore the intended redirect URI is:

`https://mealcart-5d62b.web.app/kroger/callback`

What is not confirmed from code alone:

- whether Firebase Hosting has already been enabled for project `mealcart-5d62b`
- whether Hosting and Functions have been deployed yet
- whether the Kroger developer app has this exact URI registered

So the URL is correct for the project, but it becomes live only after Firebase deployment.
