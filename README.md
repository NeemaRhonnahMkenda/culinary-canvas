# Culinary Canvas (Next.js)

A recipe-sharing blog: sign up, post recipes with photos, browse by cooking method
(baked, boiled, fried) and search by dish, ingredient or cook.

This is a rebuild of the [original Django version](https://github.com/NeemaRhonnahMkenda/CulinaryCanvasProject),
with the same features, so the two stacks can be compared side by side.

**Live:** https://neema-portfolio-pearl.vercel.app/culinary-canvas

## How it's built

| Concern | Approach |
| --- | --- |
| UI | Next.js App Router, React, Tailwind (scoped `.cc` theme, DM Serif Display) |
| Data | Upstash Redis (free tier) over its REST API; in-memory store for local dev |
| Accounts | scrypt password hashes with per-user salt; random session tokens in httpOnly, `SameSite=Lax` cookies scoped to `/culinary-canvas`; only a SHA-256 of each token is stored |
| Authorisation | Only a recipe's author can edit or delete it; anyone else gets a 404 |
| CSRF | Every write checks the request's `Origin` matches the site |
| Photos | Resized in the browser (max 1400px JPEG) before upload; stored in Redis; served with `nosniff`, a sandbox CSP and long-term caching. SVG and other types are rejected |
| Abuse limits | Rate limits on sign-up, log-in and posting; size limits on every field |
| Validation | One zod schema per input, shared rules client and server |

Recipe text is plain text: lines starting with `-` become a list, `1.` numbered steps,
and lines like "Ingredients" or "Method" become headings. It is rendered as text, never HTML.

## Run locally

```bash
npm install
npm run dev
```
Open http://localhost:3000/culinary-canvas. Without Redis env vars it uses an in-memory
store (a banner says so) and seeds 8 original demo recipes.

## Live on the portfolio (same deployment, separate repo)

This repo isn't deployed on its own. The
[portfolio](https://github.com/NeemaRhonnahMkenda/neema-portfolio) pulls it into its build
and serves it at `/culinary-canvas`, the same way as Waypoint:

- `routes/` holds every page and API handler; `app/` here and `app/culinary-canvas/` in the
  portfolio are one-line re-exports of them.
- Imports inside `components/`, `lib/` and `routes/` are relative, so they work from either host.
- `styles/theme.css` (cc- prefixed Tailwind tokens) and `styles/culinary.css` (scoped values).
- The host sets `NEXT_PUBLIC_CC_BASE`, `NEXT_PUBLIC_CC_ROUTE_PREFIX` and `NEXT_PUBLIC_CC_HOME_URL`.
- Data goes to the portfolio's Upstash Redis (keys start with `cc:`), alongside Waypoint's `wp:` keys.

`.github/workflows/redeploy-portfolio.yml` rebuilds the portfolio on every push to `main`
(add the `PORTFOLIO_DEPLOY_HOOK` secret, same as the Waypoint repo).

## Project structure

```
routes/        pages + API handlers (re-exported by app/ and by the portfolio)
components/    UI: Header, RecipeCard, RecipeText, pages/*
lib/           kv.ts (Redis/memory), auth.ts (passwords, sessions, guards), data.ts, types.ts
styles/        theme.css (tokens), culinary.css (scoped theme)
data/          recipes.json (original demo recipes)
```
