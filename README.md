# gullsgabage

A TanStack Start rookery. The homepage is a single placeholder:
**gullblock** (pixel-art gull), **coming soon**, **quack**.

## Stack

- **TanStack Start 1.168 / React Router 1.170** — file-based routes in `src/routes/`
- **React 19 + Vite 7**
- **Nitro 3** — server bundling, **Bun preset** (deployment runtime)
- **Tailwind CSS 4** (via `@tailwindcss/vite`)
- **ESLint 10 + Prettier 3** (+ `prettier-plugin-tailwindcss`), husky + lint-staged

## Scripts

```bash
bun install
bun run dev        # dev server on :3000 (streaming SSR, HMR)
bun run check      # eslint --fix + prettier --write + tsc --noEmit
bun run build      # production build → .output/ (Nitro, bun preset)
bun run start      # serve .output/ with bun
bun run typecheck  # tsc --noEmit
```

## Quality gate: `bun run check`

`check` runs `eslint . --fix`, `prettier --write .`, then `tsc --noEmit`.
It also runs **automatically on every commit** via a husky `pre-commit` hook
backed by lint-staged, which applies `eslint --fix` + `prettier --write` to
staged files — so every feature/fix commit lands formatted and lint-clean.

## Deployment runtime: Nitro + Bun

The Vite config wires the server through **Nitro with the `bun` preset**
(`nitro({ preset: 'bun' })` in `vite.config.ts`). Build output is `.output/`
(entry: `.output/server/index.mjs`, static assets in `.output/public/`),
started with `bun run start`.

## Deploy: Docker (homelab)

Single-service compose deploy — no DB, no S3, no auth, just the app:

```bash
cp .env.example .env   # PORT=3077 by default
docker compose up -d --build
```

The app is published on `127.0.0.1:3077` (host port from `${PORT}` in `.env`;
the container itself listens on 3000) — localhost-only, because host nginx
terminates TLS and proxies to it. Day-to-day:

```bash
docker compose restart          # restart
docker compose up -d --build    # rebuild + update
docker compose down             # teardown
```

Files, modeled after the ld-clinica deployment (minus its Postgres/MinIO/
migrate services, which this app does not need):

- `Dockerfile` — multi-stage: `base` (bun install), `builder` (`bun run build`),
  `runner` (`.output/` only, `CMD bun .output/server/index.mjs`)
- `docker-compose.yml` — the app service: restart policy, localhost port
  mapping, named network
- `.env.example` → `.env` — `PORT` (host port), `COMPOSE_PROJECT_NAME`,
  `PUBLIC_URL`
- `deploy/nginx/gullsgarba.ge.conf` + `install-site.sh` — the reverse proxy
  (below)

## nginx + TLS

Public URL: **https://gullsgarba.ge**. The site config is version-controlled at
`deploy/nginx/gullsgarba.ge.conf` and symlinked into
`/etc/nginx/sites-available/` (and `sites-enabled/`) by
`deploy/nginx/install-site.sh`, so edits land in git rather than on the box:

```bash
sudo bash deploy/nginx/install-site.sh              # symlink + nginx -t + reload
sudo certbot --nginx -d gullsgarba.ge -d www.gullsgarba.ge
```

Certificates come from certbot (`certbot.timer` handles renewal). certbot
rewrites the repo file in place, adding the `listen 443` / `ssl_certificate`
lines marked `# managed by Certbot` — those are committed, so expect the conf to
go dirty after issuance and stash it before a `git pull`.

`www` 301s to the apex: one canonical origin keeps the serverFn CSRF
same-origin check in `src/start.ts` unambiguous.

The `map $http_upgrade $connection_upgrade` block is **not** declared here —
nginx dies on a duplicate `map`, and astora-links' `astora.dev.br.conf` already
declares it once for every site on the box.

## Note: pihole

pihole is the LAN's DNS server and holds a split-horizon record for each app:
`gullsgarba.ge` and `www.gullsgarba.ge` answer with the box's LAN IP
(`192.168.88.107`) instead of the public one, so LAN clients hit nginx directly
rather than hairpinning through the router. Same real certificate either way.

Records live in `dns.hosts` in `/home/lurdo/pihole/etc-pihole/pihole.toml`, set
via a **whole-array replacement** — read the current value first or you will
wipe the other apps' entries:

```bash
docker exec pihole pihole-FTL --config dns.hosts               # read
docker exec pihole pihole-FTL --config dns.hosts '["..."]'     # replace all
dig +short gullsgarba.ge @192.168.88.107                       # verify
```

`etc-pihole/hosts/custom.list` is regenerated from `pihole.toml` — never edit it
directly. pihole's admin UI is on `http://<box>:8080/admin`; it was moved off
80/443 so nginx could bind them.

## Notes

- **File-based routes** — `src/routes/__root.tsx` (full document shell:
  `<html>`, `<head>` via `HeadContent`, `<body>` via `Outlet` + `Scripts`;
  custom `notFoundComponent` gull 404) and `src/routes/index.tsx`. Route
  tree is generated to `src/routeTree.gen.ts` by the Vite plugin.
- **SSR mode per route** — the shore page runs `ssr: true` (full SSR via the
  streaming `defaultStreamHandler`). Per-route SSR is configured with the
  route `ssr` option (`true | false | 'data-only'`).
- **CSRF middleware** — `src/start.ts` (`createStart`) composes
  `createCsrfMiddleware` scoped to `serverFn` requests (same-origin RPC
  endpoints reject cross-site requests with 403) plus a response tag
  (`x-gullsgabage: squawk`).
- **gullblock** — `src/resources/gullblock.png` is generated by
  `bun scripts/make-gullblock.ts` (blocky pixel-art gull, transparent
  background, white fill + slate outline).
