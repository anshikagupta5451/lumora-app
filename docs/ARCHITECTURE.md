# Architecture

How the Lumora client is put together: routing, the API layer, state, and theming. For setup and scripts see [../README.md](../README.md).

---

## 1. Layers

```
app/                   screens — routing, layout, screen-local state
  ↓ calls
src/api/               one module per backend resource
  ↓ all go through
src/api/client.ts      apiFetch: base URL, auth header, error unwrapping
  ↓ reads token from
src/store/useAuthStore zustand + expo-secure-store
```

Cross-cutting: `src/theme/` (colors), `components/` (shared UI), `src/lib/` (device APIs and schemas).

There is no data-fetching library. Screens fetch in `useEffect` / `useFocusEffect`, hold results in `useState`, and manage their own loading flags. That is the established pattern — follow it rather than introducing React Query in one screen.

---

## 2. Routing (expo-router 6)

File-based, with `typedRoutes` enabled in [app.json](../app.json) — route strings are type-checked, and generated types land in `.expo/types`.

### Route groups

| Group | Purpose |
| --- | --- |
| `app/index.tsx` | Entry gate. Calls `loadAuth()`, then redirects to `(main)/(tabs)/home` or `(auth)/login`. Renders `null` while checking. |
| `app/(auth)/` | `login`, `signup` |
| `app/(onboarding)/` | `skin-type` → `concerns` → `sensitivities` → `goals`; the last step saves the profile |
| `app/(main)/` | Everything post-auth. Stack with headers hidden. |
| `app/(main)/(tabs)/` | Bottom tab bar |

Parenthesized directories are **groups** — they organize files without adding a URL segment.

### Layout tree

```
app/_layout.tsx           SafeAreaProvider → ThemeProvider → Stack → Toast
  app/(auth)/_layout.tsx
  app/(main)/_layout.tsx        Stack, headerShown: false
    app/(main)/(tabs)/_layout.tsx   Tabs + QuickActionSheet
  app/(onboarding)/_layout.tsx
```

The root layout ([app/_layout.tsx](../app/_layout.tsx)) also calls `setupPushNotifications()` whenever `isAuthenticated` flips true. It does no font loading — see [Typography](#6-typography).

### The tab bar

Five visible tabs — Brief (`home`), Explore, the center **+** button, Community, Profile — defined in [app/(main)/(tabs)/_layout.tsx](<../app/(main)/(tabs)/_layout.tsx>).

Two things to know:

- **`add-action` is not a screen.** Its `tabBarButton` is overridden to open `QuickActionSheet`, a modal listing Create routine / Add product / Write a review / Scan a product. The file exists only so the tab slot renders.
- **`routine` is hidden** via `href: null` — the route still works, it just has no tab.

Detail routes use dynamic segments: `post/[id]`, `product/[id]`, `user/[id]`.

---

## 3. Data layer

### `apiFetch`

Every network call goes through [src/api/client.ts](../src/api/client.ts):

```ts
apiFetch<T>(path, options?): Promise<T>
```

It resolves `API_URL` from `EXPO_PUBLIC_API_URL`, reads the token straight off the store with `useAuthStore.getState()` (not a hook — so it is callable outside React), sets `Authorization: Bearer …` when present, skips `Content-Type` for `FormData` bodies so the boundary is set correctly, reads the body as text and parses it as JSON only if it is non-empty and parseable, then throws `new Error(data.error ?? data.message ?? "Request failed (<status>)")` on a non-2xx response.

Consequences worth remembering:

- **Errors are plain `Error`s.** No status code, no typed error body. Screens catch and show a toast.
- **A 204 or empty body resolves to `null`.** Callers that declare a non-nullable `T` for a no-content endpoint are lying to themselves.
- **No refresh flow.** A `refreshToken` is stored at login but never used; an expired access token surfaces as an ordinary error and the user has to log in again.

### Resource modules

One file per resource in `src/api/`, each exporting thin typed functions:

| Module | Endpoints |
| --- | --- |
| `auth.ts` | `POST /auth/login`, `/auth/signup` |
| `checkins.ts` | `/checkins`, `/checkins/today`, `/checkins/history`, `/checkins/stats` |
| `ingredients.ts` | `/ingredients`, `/ingredients/:name` |
| `posts.ts` | `/posts`, `/posts/:id`, `/like`, `/bookmark`, `/comments`, `/posts/mine/all`, `/posts/bookmarked/all`, `POST /uploads/images` |
| `products.ts` | `/products`, `/products/:id`, `/products/barcode/:code` |
| `recommendations.ts` | `/recommendations/latest`, `/generate`, `/:id/feedback` |
| `reviews.ts` | `/reviews` |
| `routines.ts` | `/routines`, `/routines/me`, `/routine-steps/:id/log` |
| `skinProfile.ts` | `/skin-profile`, `/skin-profile/me` |
| `userProducts.ts` | `/user-products`, `/user-products/:id` |
| `users.ts` | `/users/me`, `/users/:id/public`, `/users/push-token` |
| `weather.ts` | `/weather/current?lat=&lon=` |

Image upload is the one multipart call: `uploadPostImages(uris)` in [src/api/posts.ts](../src/api/posts.ts) builds a `FormData` of local URIs and returns hosted URLs, which are then attached to the post.

---

## 4. State

### Zustand

**`useAuthStore`** ([src/store/useAuthStore.ts](../src/store/useAuthStore.ts)) — `user`, `accessToken`, `isAuthenticated`, plus `setAuth` / `logout` / `loadAuth` / `updateUser`. Tokens and the serialized user go to `expo-secure-store` through a small wrapper that no-ops on web (SecureStore has no web implementation), so **web sessions do not persist**. `loadAuth()` rehydrates on cold start and is called once from `app/index.tsx`.

**`useOnboardingStore`** ([src/store/useOnboardingStore.ts](../src/store/useOnboardingStore.ts)) — in-memory only. Accumulates skin type, concerns, sensitivities, and goals across the four steps; the final step posts them and calls `reset()`. Killing the app mid-onboarding loses the answers by design.

### Everything else

Screen-local `useState`. Lists refetch with `useFocusEffect` so returning from a detail screen shows fresh data — that is the substitute for a cache.

---

## 5. Theming

Two color systems coexist. Know which one you are in.

**Runtime palettes** — [src/theme/palettes.ts](../src/theme/palettes.ts) defines three named palettes: `bloom` (pink, default), `current` (blue), `midnight` (dark). Each is a flat `Palette` of `background`, `card`, `border`, `primary`, `primaryLight`, `accent`, `foreground`, `muted`, and a two-stop `gradient`. [ThemeContext](../src/theme/ThemeContext.tsx) holds the active name, persists it to SecureStore, and exposes `useTheme()`. Because the choice is dynamic, these colors must be applied through the `style` prop:

```tsx
const { theme } = useTheme()
<View style={{ backgroundColor: theme.card, borderColor: theme.border }} />
```

**NativeWind classes** — [tailwind.config.ts](../tailwind.config.ts) hardcodes the *bloom* palette under names like `bg-primary` and `text-foreground`. These are static and **do not follow the theme switch**. Use them for layout, spacing, typography, and radii; use `theme.*` for anything colored that should respond to the selected theme. Mixing both on one element (`className` for layout, `style` for color) is the normal pattern here.

Note the app does not use the OS light/dark setting for its palette — `midnight` is a user choice. `constants/theme.ts` and `hooks/use-color-scheme.ts` are Expo template leftovers and are largely unused.

---

## 6. Typography

**Import `Text` and `TextInput` from [components/ui/Text.tsx](../components/ui/Text.tsx), never from `react-native`.** That module is the only thing that applies Plus Jakarta Sans; an `import { Text } from "react-native"` silently renders in the system font.

The font is **embedded natively** by the `expo-font` config plugin in [app.json](../app.json), not loaded at runtime — so **adding or changing a font needs a native rebuild** (`npx expo run:android`), not just a Metro reload.

Why it is built this way:

- React 19 dropped `defaultProps` for function components, and the automatic JSX runtime this project compiles through never reads them. The previous `Text.defaultProps.style` assignment in the root layout was inert, so the app rendered entirely in the system font.
- A single static font file can't carry multiple weights. Android gets a real weighted family from the plugin's `fontDefinitions`, so `fontFamily: "Plus Jakarta Sans"` plus any `fontWeight` resolves to the right file.
- iOS resolves fonts by the family name inside the file, and Google ships Plus Jakarta Sans with Regular **and Bold** under `Plus Jakarta Sans` while Medium, SemiBold and ExtraBold each carry their own family name. The wrapper maps weight → family on iOS to compensate.
- Both wrappers are registered with NativeWind's `cssInterop`, so `className` is resolved into `style` *before* the wrapper reads `fontWeight`. That is what keeps `font-medium` / `font-semibold` / `font-bold` working.

Embedded weights are 400, 500, 600, 700, 800. A `fontWeight` outside that set falls back to the nearest family the map names.

---

## 7. Device integration

| Concern | Where | Behavior |
| --- | --- | --- |
| Location | [src/lib/location.ts](../src/lib/location.ts) | `getCurrentLocation()` requests foreground permission, returns `{lat, lon}` or `null`. Feeds the weather-based recommendation on the home screen. |
| Push | [src/lib/notifications.ts](../src/lib/notifications.ts) | Requests permission, gets an Expo push token using the EAS `projectId` from `expo-constants`, creates the Android `default` channel, registers the token with the backend. Bails out on web, on simulators (`!Device.isDevice`), and when permission is denied. |
| Camera | `app/(main)/scan-product.tsx` | `expo-camera` barcode scan → `/products/barcode/:code`. |
| Images | `expo-image-picker` → `uploadPostImages` | Post composer and review flows. |
| Secure storage | `useAuthStore`, `ThemeContext` | Tokens, user JSON, theme name. |

---

## 8. Conventions

- **Text** always comes from `components/ui/Text`, never `react-native`.
- **Screens** are default exports named `XxxScreen`; **components** are named exports in PascalCase files. `components/ui/` holds primitives (`Button`, `Card`, `Badge`); the older lowercase-hyphen files (`themed-text.tsx`, `parallax-scroll-view.tsx`) are template remnants.
- **Imports are relative** (`../../../src/api/posts`) — no path alias is configured. Deep screens carry long prefixes.
- **Validation** lives in `src/lib/validation/` as Zod schemas with inferred input types, wired to React Hook Form via `@hookform/resolvers`.
- **Feedback** is `react-native-toast-message`, rendered once in the root layout.
- **Safe areas** are handled per screen with `useSafeAreaInsets()` rather than `SafeAreaView`.

## 9. Known rough edges

- `SiteHeader` and `SiteFooter` are not imported anywhere.
- `.gitignore` ignores `/android`, but a generated `android/` directory is present in the working tree (untracked).
- Three `react-hooks/exhaustive-deps` warnings remain, all on deliberate mount-only effects.
- No test setup exists.
