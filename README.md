# Lumora

A skincare companion app built with **Expo (SDK 54)** and **expo-router**. Lumora pairs a personal skin profile with daily context — weather, mood check-ins, and your product shelf — to generate a routine recommendation, and adds a community feed for reviews and discussion.

> **Client only.** This repo is the React Native app. It talks to a separate Lumora backend over REST (see [Configuration](#configuration)).

---

## Features

| Area | What it does |
| --- | --- |
| **Auth** | Email/password login and signup, Google sign-in, forgot/reset password by emailed code; tokens stored in `expo-secure-store` |
| **Onboarding** | Four steps — skin type, concerns, sensitivities, goals — saved as a skin profile |
| **Daily brief** (`home`) | Rule-based "Today's brief" from UV, air quality, humidity, scans, check-ins and your shelf; mood check-in with optional photo; streak tracking |
| **Journal** | Check-in history with photos and notes. Free tier keeps photos on the device; premium uploads them |
| **Face scan** | Selfie against an oval guide → concern scores and on-photo markers (Gemini vision, with a heuristic fallback); product suggestions from your shelf, the catalog, or the web |
| **Routines** | Build AM/PM routines, log step completion, delete routines |
| **Products** | Browse the catalog; scan a barcode in a shop for an "Is this right for me?" verdict (sensitivities, overlaps with your shelf, budget); track your own shelf (add custom products); write reviews |
| **Community** | Post feed with categories, likes, bookmarks, comments, reporting, deleting your own posts, image uploads |
| **Ingredients** | Searchable glossary |
| **Profile** | Public profiles, stats and bounty points, editable profile, three selectable themes, settings |
| **Admin** | Product catalog management with Open Beauty Facts lookup (barcode or search). Visible only to emails in the backend's `ADMIN_EMAILS` |
| **Push** | Expo push tokens registered with the backend on login; nightly streak reminder from the backend |

Project status — what's done and what's still open — is tracked in [../STATUS.md](../STATUS.md).

## Tech stack

- **Expo SDK 54** / React Native 0.81 / React 19 — new architecture + React Compiler enabled
- **expo-router 6** — file-based routing with typed routes
- **NativeWind 4** (Tailwind) for utility classes, plus a runtime palette for themeable colors
- **Zustand** for auth and onboarding state
- **React Hook Form + Zod** for forms and validation
- **lucide-react-native** icons, **Plus Jakarta Sans** embedded natively via the `expo-font` config plugin
- **TypeScript** throughout

---

## Getting started

### Prerequisites

- Node.js 20+
- A running Lumora backend (default `http://localhost:4000`)
- For native builds: Android Studio (Android) or Xcode (iOS)

### Install and run

```bash
npm install
npx expo start
```

The app uses native modules (`expo-camera`, `expo-secure-store`, `expo-notifications`, `expo-location`), so **Expo Go will not work** — you need a development build:

```bash
npm run android   # expo run:android
npm run ios       # expo run:ios
```

Or install a prebuilt dev client with EAS:

```bash
eas build --profile development --platform android
```

### Configuration

Create a `.env` in the project root (it is gitignored):

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.10:4000
```

| Variable | Required | Notes |
| --- | --- | --- |
| `EXPO_PUBLIC_API_URL` | yes | Base URL of the Lumora API. Falls back to `http://localhost:4000`. On a physical device use your machine's LAN IP, not `localhost`. |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | for Google sign-in | Web OAuth client ID. Must equal the backend's `GOOGLE_WEB_CLIENT_ID`. Android also needs a matching Android OAuth client per signing key. See [docs/GOOGLE_SIGN_IN.md](docs/GOOGLE_SIGN_IN.md). |

Only `EXPO_PUBLIC_`-prefixed variables are inlined into the bundle — treat them as public.

Android push notifications also need a valid `google-services.json` at the project root.

Fonts are embedded at build time rather than loaded at runtime, so a fresh clone needs a native build (`npm run android`) before text renders in Plus Jakarta Sans.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the Metro dev server |
| `npm run android` | Build and run the Android app |
| `npm run ios` | Build and run the iOS app |
| `npm run web` | Start the web build (partial support — native-only features no-op) |
| `npm run lint` | ESLint via `expo lint` |
| `npx tsc --noEmit` | Type check |

## Project layout

```
app/                  expo-router routes (see docs/ARCHITECTURE.md)
  (auth)/             login, signup, forgot-password, reset-password
  (onboarding)/       skin-type, concerns, sensitivities, goals
  (main)/             authenticated app (detail screens, scanners, journal, admin/)
    (tabs)/           home, explore, community, profile, routine
assets/fonts/         Plus Jakarta Sans weights, embedded by the expo-font plugin
components/           shared components; components/ui/ holds primitives
  ui/Text.tsx         Text + TextInput that apply the app font — import these
src/api/              one module per backend resource, all via apiFetch
src/store/            zustand stores (auth, onboarding, scan and face-scan handoff)
src/theme/            palettes, ThemeContext, icon colors
src/lib/              location, notifications, Google sign-in, local check-in photos, zod schemas
docs/                 architecture and Google sign-in setup
.claude/agents/       Claude Code subagents for this repo (see ../README.md)
```

## Builds and releases

Build profiles live in [eas.json](eas.json): `development` (dev client), `preview` (internal APK), `production`. Over-the-air updates go through `expo-updates` on the matching channel.

```bash
eas build --profile preview --platform android
eas update --channel preview
```

## Documentation

- [../STATUS.md](../STATUS.md) — completed features and open gaps across app, backend and website
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — routing, data layer, state, theming
- [docs/GOOGLE_SIGN_IN.md](docs/GOOGLE_SIGN_IN.md) — OAuth clients, signing keys, troubleshooting
- [CONTRIBUTING.md](CONTRIBUTING.md) — workflow and conventions
- [AGENTS.md](AGENTS.md) — instructions for AI coding agents
