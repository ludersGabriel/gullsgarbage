# gullsgabage

A TanStack Start rookery: **hello gulls** — sea-gull themed, full-stack React
built on TanStack Start (file-based TanStack Router, Vite, Nitro).

## Stack

- **TanStack Start 1.168 / React Router 1.170** — file-based routes in `src/routes/`
- **React 19 + Vite 7**
- **Nitro 3** — server bundling, **Bun preset** (deployment runtime)
- **Tailwind CSS 4** (via `@tailwindcss/vite`)
- **zod 4** — search params & server-function validation (Standard Schema)
- **ESLint 10 + Prettier 3** (+ `prettier-plugin-tailwindcss`), husky + lint-staged

## Scripts

```bash
bun install
bun run dev        # dev server on :3000 (streaming SSR, HMR)
bun run check      # eslint --fix + prettier --write (also runs on every commit)
bun run build      # production build → .output/ (Nitro, bun preset)
bun run start      # serve .output/ with bun
bun run typecheck  # tsc --noEmit
```

## Deployment runtime: Nitro + Bun

The Vite config wires the server through **Nitro with the `bun` preset**
(`nitro({ preset: 'bun' })` in `vite.config.ts`) — the app model (routes,
loaders, server functions) stays unchanged; only the server packaging
differs. Build output is `.output/` (entry: `.output/server/index.mjs`,
static assets in `.output/public/`), started with `bun run start`.

## Quality gate: `bun run check`

`check` runs `eslint . --fix` and `prettier --write .`. It also runs
**automatically on every commit** via a husky `pre-commit` hook backed by
lint-staged, which applies `eslint --fix` + `prettier --write` to staged
files — so every feature/fix commit lands formatted and lint-clean.

## Architecture notes

- **File-based routes** — `src/routes/__root.tsx` (full document shell:
  `<html>`, `<head>` via `HeadContent`, `<body>` via `Outlet` + `Scripts`;
  custom `notFoundComponent` for unknown paths), `src/routes/index.tsx`.
  Route tree is generated to `src/routeTree.gen.ts` by the Vite plugin.
- **Validated search params** — the index route validates `?flock=` and
  `?squawks=` with a zod 4 schema in `validateSearch` (defaults + `.catch()`
  fallbacks); `loaderDeps` keys the loader cache on them.
- **Route loaders** — the index loader awaits the fast server data and
  returns the slow tide report as an **unawaited promise**; `<Await>` + the
  `defaultStreamHandler` stream it in after the first paint.
- **Typed server functions** — `src/server/gulls.functions.ts` exposes
  `getGullReport` (GET), `getTideReport` (GET, deferred), `squawk` (POST)
  with zod validators, function middleware, and fully inferred client types.
- **Explicit server-only boundary** — `src/server/gulls.server.ts` is marked
  `import '@tanstack/react-start/server-only'` (+ `.server.ts` filename
  import protection). The client bundle receives RPC stubs only; verified:
  no server-store strings in the client assets.
- **SSR mode per route** — the shore page runs `ssr: true` (full streaming
  SSR). Per-route SSR is configured with the route `ssr` option
  (`true | false | 'data-only'`); the current single-route app uses the
  default full-SSR mode.
- **Request middleware** — `src/start.ts` (`createStart`) composes:
  `createCsrfMiddleware` scoped to `serverFn` requests (server functions are
  same-origin RPC endpoints, so cross-site requests are rejected — verified:
  bare/cross-site calls get 403, same-origin calls pass) and a response tag
  (`x-gullsgabage: squawk`); function middleware adds `x-gull-middleware`.
