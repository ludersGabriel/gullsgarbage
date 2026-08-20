# gullsgabage

A TanStack Start rookery: **hello gulls** — sea-gull themed, full-stack React
built on TanStack Start (file-based TanStack Router, Vite, srvx).

## Stack

- **TanStack Start 1.168 / React Router 1.170** — file-based routes in `src/routes/`
- **React 19 + Vite 7**
- **Tailwind CSS 4** (via `@tailwindcss/vite`)
- **zod 4** — search params & server-function validation (Standard Schema)
- **srvx** — universal web-standards server; the same build runs on Node.js or Bun

## Scripts

```bash
bun install
bun run dev        # dev server on :3000 (streaming SSR, HMR)
bun run build      # production build → dist/ (client + server)
bun run start      # serve dist/ (srvx prod mode)
bun run typecheck  # tsc --noEmit
```

## Architecture notes

- **File-based routes** — `src/routes/__root.tsx` (full document shell:
  `<html>`, `<head>` via `HeadContent`, `<body>` via `Outlet` + `Scripts`),
  `src/routes/index.tsx`. Route tree is generated to `src/routeTree.gen.ts`
  by the Vite plugin. The root route also defines a custom
  `notFoundComponent` (gull-themed 404) for unknown paths.
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
  no server-store strings in `dist/client`.
- **SSR mode per route** — the shore page runs `ssr: true` (full streaming
  SSR). Per-route SSR is configured with the route `ssr` option
  (`true | false | 'data-only'`); the current single-route app uses the
  default full-SSR mode.
- **Request middleware** — `src/start.ts` (`createStart`) composes:
  `createCsrfMiddleware` scoped to `serverFn` requests (server functions are
  same-origin RPC endpoints, so cross-site requests are rejected — verified:
  bare/cross-site calls get 403, same-origin calls pass) and a response tag
  (`x-gullsgabage: squawk`); function middleware adds `x-gull-middleware`.
- **Deployment runtime** — the app model is runtime-agnostic (web-standard
  `Request`/`Response` handler). The same `dist/` build is served by srvx on
  **Node.js** (`node_modules/.bin/srvx serve --entry=./dist/server/server.js
--prod --static=../client`) or **Bun** (`bun node_modules/srvx/bin/srvx.mjs
serve ...`) with no application changes.
