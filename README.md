# Lumora

A skincare companion app built with **Expo (SDK 54)** and **expo-router**. Lumora pairs a personal skin profile with daily context — weather, mood check-ins, and your product shelf — to generate a routine recommendation, and adds a community feed for reviews and discussion.

> **Client only.** This repo is the React Native app. It talks to a separate Lumora backend over REST (see [Configuration](#configuration)).

---

## Features

| Area | What it does |
| --- | --- |
| **Auth** | Email/password login and signup; tokens stored in `expo-secure-store` |
| **Onboarding** | Four steps — skin type, concerns, sensitivities, goals — saved as a skin profile |
| **Daily brief** (`home`) | Weather-aware recommendation, mood check-in, streak tracking |
| **Routines** | Build AM/PM routines, log step completion |
| **Products** | Browse the catalog, scan a barcode, track your own shelf, write reviews |
| **Community** | Post feed with categories, likes, bookmarks, comments, reporting, image uploads |
| **Ingredients** | Searchable glossary |
| **Profile** | Public profiles, stats, editable name, three selectable themes |
| **Push** | Expo push tokens registered with the backend on login |

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
  (auth)/             login, signup
  (onboarding)/       skin-type, concerns, sensitivities, goals
  (main)/             authenticated app
    (tabs)/           home, explore, community, profile, routine
assets/fonts/         Plus Jakarta Sans weights, embedded by the expo-font plugin
components/           shared components; components/ui/ holds primitives
  ui/Text.tsx         Text + TextInput that apply the app font — import these
src/api/              one module per backend resource, all via apiFetch
src/store/            zustand stores (auth, onboarding)
src/theme/            palettes, ThemeContext, typography
src/lib/              location, notifications, zod schemas
constants/, hooks/    Expo template leftovers (theme colors, color scheme)
```

## Builds and releases

Build profiles live in [eas.json](eas.json): `development` (dev client), `preview` (internal APK), `production`. Over-the-air updates go through `expo-updates` on the matching channel.

```bash
eas build --profile preview --platform android
eas update --channel preview
```

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — routing, data layer, state, theming
- [CONTRIBUTING.md](CONTRIBUTING.md) — workflow and conventions
- [AGENTS.md](AGENTS.md) — instructions for AI coding agents
