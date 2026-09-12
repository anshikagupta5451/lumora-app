# AGENTS.md

Instructions for AI coding agents working in this repo. Humans: see [README.md](README.md) and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## 1. Expo HAS CHANGED

Read the exact versioned docs at **https://docs.expo.dev/versions/v54.0.0/** before writing any code.

This project is on **Expo SDK 54 / React Native 0.81 / React 19 / expo-router 6**. Pre-SDK-50 patterns are wrong here and training data is full of them. Specifically:

- Routing is **expo-router 6**, not React Navigation directly. Use `<Stack>`, `<Tabs>`, `useRouter()`, `useLocalSearchParams()`, `<Redirect>`, `<Link>`.
- The **new architecture** and the **React Compiler** are enabled (`app.json` → `experiments`). Do not add manual `useMemo`/`useCallback` purely for render performance; do not reach for legacy bridge APIs.
- `typedRoutes` is on — route strings are type-checked. If a `router.push()` path errors, the route is wrong; fix the path rather than casting. (`as any` appears in the tabs layout; do not spread that pattern.)
- Reanimated is **v4** with `react-native-worklets`. Check the v4 docs before writing worklets.
- Check the installed version in `package.json` before using any `expo-*` API, and verify it against the v54 docs.

## 2. Orientation

| Need | Read |
| --- | --- |
| What the app does, how to run it | [README.md](README.md) |
| Routing, data flow, state, theming | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| Branching, commits, checks | [CONTRIBUTING.md](CONTRIBUTING.md) |

## 3. Rules that are easy to get wrong

**Networking.** Every request goes through `apiFetch` in [src/api/client.ts](src/api/client.ts), and every endpoint belongs in a `src/api/*.ts` module. Never call `fetch` from a screen, never hardcode a base URL, never build an auth header by hand.

**Data fetching.** There is no React Query / SWR. Screens fetch in `useEffect` or `useFocusEffect`, store results in `useState`, and track their own loading flags. Match that. Do not introduce a data-fetching or caching library for one screen.

**Colors.** Two systems, and picking the wrong one silently breaks theming:

- Themeable color → `const { theme } = useTheme()` and the `style` prop (`style={{ color: theme.foreground }}`).
- Layout, spacing, typography, radii → NativeWind `className`.

Tailwind's color names (`bg-primary`, `text-foreground`) are hardcoded to the *bloom* palette and do **not** react to the theme switch. Mixing `className` for layout with `style` for color on the same element is the house style.

**Auth state.** Read it with `useAuthStore(s => s.x)` inside components, `useAuthStore.getState()` outside. Tokens live in `expo-secure-store` and the storage wrapper no-ops on web.

**Forms.** React Hook Form + a Zod schema in `src/lib/validation/`, wired with `@hookform/resolvers`.

**Feedback.** `Toast.show(...)` from `react-native-toast-message`. `<Toast />` is already mounted in the root layout — don't add another.

**Safe areas.** `useSafeAreaInsets()` and manual padding, as existing screens do. Not `SafeAreaView`.

**Imports.** Relative paths only; no alias is configured. Don't add one as a side effect of another change.

**Text.** Import `Text` and `TextInput` from `components/ui/Text`, **never from `react-native`**. That wrapper is the only thing applying Plus Jakarta Sans; importing from `react-native` silently falls back to the system font. Fonts are embedded natively via the `expo-font` config plugin in `app.json`, so font changes need `npx expo run:android`, not a reload.

**Icons.** `lucide-react-native`.

## 4. Placement

| Adding | Goes in |
| --- | --- |
| A screen | `app/…` — pick the right group: `(auth)`, `(onboarding)`, `(main)`, `(main)/(tabs)` |
| A backend call | the matching `src/api/*.ts`, or a new module for a new resource |
| A reusable component | `components/` (PascalCase file, named export) |
| A primitive | `components/ui/` |
| A Zod schema | `src/lib/validation/` |
| Device/platform glue | `src/lib/` |

Screens are default exports named `XxxScreen`.

## 5. Do not

- Add a dependency without being asked — especially a navigation, state, or data-fetching library. The stack is settled.
- Edit `.env`, `google-services.json`, `app.json` credentials, or anything under `android/` unless that is the task. `android/` is gitignored and generated.
- Touch `dist/`, `.expo/`, or `node_modules/`.
- Re-add `Text.defaultProps` / `TextInput.defaultProps` style hacks. React 19 ignores `defaultProps` on function components and the JSX runtime here never reads them — this was already tried and removed. See [Typography](docs/ARCHITECTURE.md#6-typography).
- Assume tests exist. There is no test runner configured; verify with `npx tsc --noEmit` and `npm run lint`.
- Claim a change works on device unless it was actually run there.

## 6. Before finishing

```bash
npx tsc --noEmit
npm run lint
```

Both should be clean for files you touched. Say plainly what you verified and what you did not.
