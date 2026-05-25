# Kroger + Firebase setup

Redirect URI registered in the Kroger developer app:

`https://mealcart-5d62b.web.app/kroger/callback`

## Enable Firebase Hosting

Firebase is already connected to this app. The remaining setup is to make sure Firebase Hosting and Cloud Functions are deployed for the same project.

Firebase Hosting for this project uses the default Hosting domain:

`https://mealcart-5d62b.web.app`

What needs to happen now:

1. Use the Firebase CLI with project `mealcart-5d62b`.
2. Set the Kroger secrets for Cloud Functions.
3. Install the Functions dependencies.
4. Deploy Hosting and Functions.

## Step-by-step terminal runbook

Run these commands in order.

### Step 1: Install Firebase CLI

Command:

```bash
npm install -g firebase-tools
```

What you should see:

- npm installs the `firebase-tools` package globally
- the command ends successfully without errors

If you see a permissions error:

- use the Node/npm setup already used on your machine
- or run the command with the package manager approach your environment expects

### Step 2: Log in to Firebase

Command:

```bash
firebase login
```

What you should see:

- the terminal prints a message similar to `Visit this URL on this device to log in`
- your browser opens a Google sign-in page
- after login, the terminal shows a success message similar to `Success! Logged in as ...`

What to choose:

- sign in with the Google account that has access to Firebase project `mealcart-5d62b`

### Step 3: Move into the project folder

Command:

```bash
cd /Users/r/Documents/ReactNativeProjects/MealCartRnapp
```

What you should see:

- usually nothing prints
- your terminal is now at the project root

### Step 4: Select the Firebase project

Command:

```bash
firebase use mealcart-5d62b
```

What you should see:

- if already linked, a message similar to `Now using alias default (mealcart-5d62b)`
- if not linked yet, Firebase may say the project alias is not found

If the project is not linked locally yet, run this instead:

```bash
firebase use --add
```

What you should see:

- Firebase lists available projects
- it asks you to select one project
- then it asks for an alias name

What to choose:

- select `mealcart-5d62b`
- for alias, choose `default`

After that, run again to confirm:

```bash
firebase use mealcart-5d62b
```

Important:

- Firebase Hosting is typically activated automatically the first time Hosting is deployed for the project.
- Cloud Functions become active when the Functions code is deployed.
- There is no separate Squarespace or custom domain step needed for this Firebase-only flow.

## What this implementation adds

- Firebase Hosting rewrite for `/kroger/callback`
- Cloud Function callback to exchange the Kroger OAuth code for tokens
- Firestore storage for each signed-in user's Kroger tokens
- Automatic access-token refresh before user-token API calls
- A frontend service wrapper for auth session creation and Kroger API calls

## Required Firebase secrets

Set these before deploying functions:

### Step 5: Add the Kroger client ID secret

```bash
firebase functions:secrets:set KROGER_CLIENT_ID
```

What you should see:

- Firebase prompts you to enter a secret value

What to do:

- paste the Kroger app `client_id`
- press `Enter`

What you should see after:

- a success message confirming the secret version was created

### Step 6: Add the Kroger client secret

```bash
firebase functions:secrets:set KROGER_CLIENT_SECRET
```

What you should see:

- Firebase prompts you to enter a secret value

What to do:

- paste the Kroger app `client_secret`
- press `Enter`

What you should see after:

- a success message confirming the secret version was created

## Install Functions dependencies

### Step 7: Open the functions folder

```bash
cd /Users/r/Documents/ReactNativeProjects/MealCartRnapp/functions
```

What you should see:

- usually nothing prints
- your terminal is now inside the `functions` folder

### Step 8: Install Functions packages

```bash
npm install
```

What you should see:

- npm installs `firebase-admin` and `firebase-functions`
- a `node_modules` folder is created inside `/functions`
- the command ends with a success summary

If npm shows warnings:

- warnings are usually okay if the install completes successfully
- stop only if the command ends with an actual error

## Deploy

### Step 9: Go back to the project root

```bash
cd /Users/r/Documents/ReactNativeProjects/MealCartRnapp
```

What you should see:

- usually nothing prints

### Step 10: Deploy Functions and Hosting

```bash
firebase deploy --only functions,hosting
```

What you should see:

- Firebase prepares and uploads Hosting files
- Firebase prepares and deploys the Cloud Functions
- if Hosting was not previously active, Firebase enables it as part of the deploy
- the terminal ends with a success summary

Typical successful output includes lines similar to:

- `Deploy complete!`
- `Hosting URL: https://mealcart-5d62b.web.app`

If Firebase prompts during deploy:

- if asked to enable required Google APIs for Functions or build services, choose `Yes`
- if asked to proceed with creating backend resources needed by Functions, choose `Yes`

This deploy does all of the following:

- deploys the Cloud Functions in `functions/src`
- deploys Firebase Hosting
- activates the Hosting rewrite for `/kroger/callback`

### Step 11: Verify the base Hosting URL

Open:

`https://mealcart-5d62b.web.app`

What you should see:

- the placeholder Hosting page from `hosting/index.html`

### Step 12: Verify the callback route exists

Open:

`https://mealcart-5d62b.web.app/kroger/callback`
```
What you should see:

- the route should respond through the Cloud Function
- opening it directly without Kroger query params may redirect to an app error URL or show an error flow, which is expected

What matters:

- the route is live
- Kroger can redirect to it
- the exact URL can now be registered and used

## Verify after deploy

Open the base Hosting URL:

`https://mealcart-5d62b.web.app`

It should show the placeholder Hosting page.

Then the Kroger callback route should exist at:

`https://mealcart-5d62b.web.app/kroger/callback`

Notes:

- Opening the callback URL directly in the browser without Kroger query params may show an error redirect, which is expected.
- What matters is that the route is live and handled by the `krogerOAuthCallback` function.

## Short version for this project

Because Firebase is already being used in the app, you do not need to reconfigure the existing Firebase client setup. You only need to:

1. keep using project `mealcart-5d62b`
2. add the Kroger secrets to Firebase Functions
3. install dependencies inside `/functions`
4. deploy `functions` and `hosting`
5. register `https://mealcart-5d62b.web.app/kroger/callback` in the Kroger developer app

## App flow

1. User signs in to Meal Cart with Firebase Auth.
2. App calls `createKrogerAuthSession()` from `services/krogerApi.ts`.
3. Function returns a Kroger authorize URL with a secure `state`.
4. App opens that URL in the browser.
5. Kroger redirects to `https://mealcart-5d62b.web.app/kroger/callback`.
6. Firebase Hosting rewrites the request to `krogerOAuthCallback`.
7. The function exchanges the code for tokens and stores them in Firestore under `users/{uid}/private/kroger`.
8. The function redirects back into the app using `mealcartrnmain://screens/KrogerSignupScreen?...`.
9. App calls Firebase for a short-lived app token, then calls Kroger `locations` and `products` directly from the device.
10. App continues to use Firebase for cart/user-token requests.

## Kroger OAuth scopes used here

- User login for cart access: `cart.basic:write`
- App-level product lookup: `product.compact`
- App-level location lookup: no extra scope required based on verified `GET /v1/locations` behavior

## Notes

- `krogerProxy` is kept for user-token cart calls only.
- User-token calls auto-refresh when the token is expired or close to expiring.
- `getKrogerAppToken` returns a short-lived app token for direct device-side `locations` and `products` requests.
