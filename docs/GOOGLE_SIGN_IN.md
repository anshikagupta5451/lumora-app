# Google Sign-In

How "Continue with Google" is wired, and what has to be registered where for it to work. Most failures here are configuration, not code.

## Flow

1. The app calls `GoogleSignin.signIn()` ([src/lib/googleAuth.ts](../src/lib/googleAuth.ts)), configured with the **Web** OAuth client ID.
2. Google returns an ID token whose audience is that web client ID.
3. The app posts it to `POST /auth/google`. The backend verifies it with `google-auth-library` against `GOOGLE_WEB_CLIENT_ID`, requires `email_verified`, then logs the user in, links the Google identity to an existing account with the same email, or creates a new account (`isNewUser: true` → onboarding).

## What must be registered

All of these live in **one** Google Cloud project: the one that owns the web client (currently project number `407133480571`).

| OAuth client | Type | Used by | Values |
| --- | --- | --- | --- |
| Web client | Web application | app `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, backend `GOOGLE_WEB_CLIENT_ID` | Both env vars must hold the **same** ID |
| Android client (one per signing key) | Android | Nothing references it. Google matches it by package + SHA-1 at sign-in time | Package `com.anonymous.lumoraapp` + the SHA-1 below |

Android is the part people miss. If no Android client matches the installed build's package name **and** signing certificate, sign-in fails with `DEVELOPER_ERROR` (code `10`).

### Signing keys to register

| Build | Where the SHA-1 comes from | SHA-1 |
| --- | --- | --- |
| EAS builds (development, preview, production) | `eas credentials -p android` → default keystore | `5E:A0:42:F6:02:63:75:10:E3:E7:EF:1D:B4:0C:86:3B:09:EE:D2:DF` |
| Local `npx expo run:android` | `keytool -list -v -keystore android/app/debug.keystore -storepass android` | register if you build locally |
| Google Play | Play Console → Setup → App signing → *App signing key certificate* | add after the first Play upload |

Play re-signs your app, so the store build uses a different SHA-1 from the EAS upload key. Forgetting it breaks Google sign-in for real users only.

## Adding a signing key

Google Cloud Console → project `407133480571` → APIs & Services → Credentials → Create credentials → OAuth client ID → **Android** → package name + SHA-1 → Create. It takes effect in a few minutes. You don't need to rebuild the app.

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| `DEVELOPER_ERROR` / toast "temporarily unavailable" | Missing Android client for this build's SHA-1, wrong package name, or the Android client is in a different project from the web client |
| Backend `401 Invalid Google token` | App and backend web client IDs differ (audience mismatch). Check the backend logs |
| Backend `403 … not verified` | The Google account's email isn't verified. This is expected, and the account is refused on purpose |
| `RNGoogleSignin could not be found` | The installed binary predates the package. Rebuild the dev client |

## Note on `google-services.json`

That file belongs to Firebase project `lumora-305bd` and is used for **push notifications** (FCM). Google Sign-In doesn't read it here: sign-in is driven entirely by the web client ID above. Don't add Firebase OAuth clients expecting them to fix sign-in unless you also move the web client to that project.

## Before launch

`com.anonymous.lumoraapp` is the Expo placeholder package name. Once published, a Play Store package name can never change. Choose the real one (e.g. `com.<yourdomain>.lumora`) **before** the first store upload. Changing it means updating `app.json`, creating new EAS credentials, and registering new Android OAuth clients.
