# Contributing

Working agreements for the Lumora app. Setup lives in [README.md](README.md); how the code is organized is in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Getting set up

```bash
npm install
npm run android   # or: npm run ios
```

Create a `.env` in the project root with your API base URL:

```bash
EXPO_PUBLIC_API_URL=http://<your-lan-ip>:4000
```

Expo Go won't run this app — it depends on native modules (camera, secure store, notifications, location). You need a development build. On a physical device, `EXPO_PUBLIC_API_URL` must point at your machine's LAN IP; `localhost` resolves to the phone.

## Branching

`main` is the integration branch. Work on a branch off `main`:

```
feat/routine-reminders
fix/community-like-count
chore/bump-expo-54
```

Don't commit directly to `main`.

## Commits

Existing history uses `type:short description` — for example `update:added image flow`. Keep to that shape and pick a type from `feat`, `fix`, `update`, `refactor`, `chore`, `docs`:

```
feat:add bookmark filter to community feed
fix:guard weather fetch when location is denied
```

Write the subject in the imperative, keep it under ~72 characters, and put the reasoning in the body when the change isn't self-evident. One logical change per commit.

**Never commit** `.env`, `google-services.json` with real credentials, keystores, `dist/`, `.expo/`, or anything under `android/` (all generated or gitignored — check `git status` before staging).

## Before you open a PR

```bash
npx tsc --noEmit
npm run lint
```

Both must be clean. There is no test suite, so **run the app** and exercise the screens you touched — on Android at minimum, and on iOS too if you changed anything platform-sensitive (safe-area padding, camera, notifications, SecureStore).

## Pull requests

Include:

- what changed and why;
- how you verified it — which platform, which screens, what you actually did;
- screenshots or a screen recording for any UI change;
- a note on new permissions, env vars, or backend endpoints the change depends on.

Keep PRs reviewable. A large refactor mixed with a feature is two PRs.

## Code conventions

Follow the surrounding code first. In short:

- **Screens** — default export, named `XxxScreen`, file in the right `app/` route group.
- **Components** — named export, PascalCase file in `components/`; primitives in `components/ui/`.
- **Text** — import `Text`/`TextInput` from `components/ui/Text`, never from `react-native`, or you lose the app font.
- **Networking** — always through a `src/api/*.ts` module and `apiFetch`. No `fetch` in screens, no hardcoded URLs.
- **State** — screen-local `useState`; zustand only for auth, onboarding, and the one-shot scan/face-scan handoffs. No new global stores without discussion.
- **Colors** — `useTheme()` + the `style` prop for anything that should follow the selected theme; NativeWind `className` for layout, spacing, and type. Tailwind's color classes are locked to the bloom palette.
- **Forms** — React Hook Form with a Zod schema from `src/lib/validation/`.
- **Imports** — relative paths; there's no alias configured.
- **User feedback** — `react-native-toast-message`, already mounted at the root.

Formatting is whatever ESLint accepts (`expo lint`); there's no Prettier config, so don't reformat files you aren't otherwise changing — it buries the real diff.

## Dependencies

Add packages with `npx expo install` rather than `npm install` so versions stay compatible with SDK 54. Expo-adjacent versions in `package.json` are pinned deliberately (`~`); don't loosen them. Adding a navigation, state, or data-fetching library is an architectural decision — raise it first.

## Working on the API

The backend is a separate service. When a change needs a new or altered endpoint, land the backend side first, then add the client function to the matching `src/api/` module with an explicit response type. Note the dependency in your PR description.
