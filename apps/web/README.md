# @acme/web

The public site of a Stackra project: the landing page, pricing, a storefront and the tenant's page-builder pages, on
one hostname per site, in English and Arabic, written in the decorator model (ADR 0094): routes and the layout are decorated classes
(`@Route`, `@Layout`), page-builder blocks are `@Block` classes, config is `@Config` classes, and the only hand-written
server code is the edge logic in `server/`. The runtime (Vite, React Router 7 framework mode, the Cloudflare Worker,
wrangler, Playwright, Lighthouse) is generated into `.stackra/`. It reads five services through the public area and
writes through exactly two public actions (`leads.lead.create`, `seo.not_found.record`). It owns no data. UI comes
through `@stackra/ui`, like the console.

| Command                  | Does                                                                                                     |
| ------------------------ | -------------------------------------------------------------------------------------------------------- |
| `pnpm gen`               | `stackra gen`: rewrites `.stackra/` from the config, the runway, the decorated classes and the manifests |
| `pnpm dev`               | React Router dev on the Workers runtime on the port of `runway.yaml`, HMR on `#stackra/*`                |
| `pnpm build`             | `stackra build --target web-ssr`: client + server build, prerender per locale                            |
| `pnpm start`             | the built site on `wrangler dev` (what the e2e tier measures)                                            |
| `pnpm test` / `test:e2e` | vitest (jsdom; workers env under `src/server`) / Playwright with axe after `build`                       |
| `pnpm typecheck`         | gen, then tsc over `src`, `.stackra`                                                                     |

## Tree

```
apps/web
├── stackra.config.ts        defineApp: key, root class, Target.WebSsr + Target.Pwa, ApiArea.Public, env class, e2e seeds, health
├── vite.extend.ts           the one build hatch: extra Vite plugin instances, merged after the stackra plugin
├── runway.yaml              dev port/host, domains and aliases, public + server vars, secret names, Worker knobs
├── package.json             three aliases: #src/*, #assets/* and #stackra/*
├── .stackra/                GENERATED (see .stackra/README.md); app-manifest.json committed
└── src/
    ├── web.app.ts           @App: provider order (site from the layout, toasts)
    ├── config/              one @Config class per fact: env, i18n, theming, site, seo, consent, analytics,
    │                        feature-flags, telemetry, edge, csp
    ├── routes/              @Route classes (landing, pricing, contact, store, product, page) and the @Layout (site)
    ├── menus/               @Menu classes: site (the header navigation, by route key)
    ├── flags/               @Flag classes: pricing-yearly-first (the pricing experiment)
    ├── analytics/           @AnalyticsEvent classes: lead-submitted
    ├── components/
    │   ├── pages/<name>/    page components typed RouteComponent<typeof XRoute>
    │   └── <name>/          site-frame, site-header, product-card, variant-picker, … with their single-use hooks
    ├── hooks/               use-variant-choice (product page + variant picker)
    ├── providers/site/      site.context.tsx (the context and SiteContextProvider) and use-site.ts
    ├── blocks/<name>/       one folder per block: <name>.block.ts (@Block), <name>.tsx, index.ts, __tests__/:
    │                        hero-section, feature-grid, pricing-table, testimonials, faq-section, cta-banner, product-grid
    ├── schemas/             one schema class per file: contact, call-to-action and each block's props
    ├── enums/               app-local class enums: billing-interval, cache-profile
    ├── errors/              typed errors: site-context-missing
    ├── server/              edge logic only: resolve-site, alternates, locale-path
    ├── overrides/leads/     lang/{en,ar}.json
    └── styles/app.css       Tailwind v4 + HeroUI v3 + the generated brand tokens, logical CSS, light and dark
```

Config is read with `useConfig(X)` in components and with `ctx.config(X)` in loaders, submits, meta and the server
helpers; never as a static. Links are route classes (`<Link to={StoreRoute} />`), so they land in the visitor's
locale mount; a block's call to action holds a `RouteKey` from `#stackra/routes`.

## Which file owns which fact

| Fact                                                      | File                                                        | Consumed by                                                      |
| --------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------- |
| What the app is, target, area, env class, e2e seeds       | `stackra.config.ts`                                         | every generated file                                             |
| Extra Vite plugins                                        | `vite.extend.ts`                                            | `.stackra/vite.config.ts` (merged last)                          |
| Dev port and host, domains, vars, secret names, Worker    | `runway.yaml`                                               | `vite.config.ts`, `wrangler.jsonc`, Playwright, Lighthouse       |
| The env contract (`VITE_*`, `STACKRA_*`, the secret name) | `src/config/env.config.ts`                                  | `gen/env.ts`, `env.d.ts`, `wrangler.jsonc` vars                  |
| Locales, default, RTL, fallbacks, URL strategy            | `src/config/i18n.config.ts`                                 | per-locale mounting in `routes.ts`, prerender, `<html lang dir>` |
| Schemes, theme colour, tenant brand override              | `src/config/theming.config.ts`                              | `root.tsx`, the site frame                                       |
| Preview hosts, fixed site, product sold, signup path      | `src/config/site.config.ts`                                 | `server/resolve-site.server.ts`, robots, the pricing table       |
| Title template, robots, sitemaps, OG kinds, noindex       | `src/config/seo.config.ts`                                  | the SEO routes, `gen/sitemap.ts`, the store route                |
| Consent categories, cookie, policy version                | `src/config/consent.config.ts`                              | the generated root, the banner                                   |
| Analytics and flag drivers, consent gating                | `src/config/analytics.config.ts`, `feature-flags.config.ts` | `gen/wiring.ts`, the generated root                              |
| Cache rules per `CacheProfile`, redirects, 404 log        | `src/config/edge.config.ts`                                 | `workers/app.ts`, `entry.server.tsx`, each route's headers       |
| CSP additions                                             | `src/config/csp.config.ts`                                  | `workers/app.ts`                                                 |
| Pages, header navigation, page-builder blocks             | `src/routes/`, `src/menus/`, `src/blocks/`                  | `routes.ts`, adapters, the experience service                    |

## How a request flows

1. Cloudflare's edge (TLS, WAF, rate limit, static assets of the client build; the root runway's `edge`).
2. `.stackra/workers/app.ts`: alias host → canonical domain; `seo.redirect.resolve` (edge-cached) → 301/302, or on to the router.
3. `SiteLayout.resolve`: host → site once per request (`sites.site.resolve`); the locale is the path prefix; the market and
   brand come with the site. Every route's `loader` receives `ctx.site` and `ctx.query` for that locale and market.
4. The route class's `loader`; its `meta` emits title, description, canonical, hreflang alternates, OG tags and JSON-LD;
   the `cache:` option names an `edge.config.ts` profile and becomes the `Cache-Control` header.
5. `.stackra/entry.server.tsx` streams the document; bots wait for the whole shell.
6. On an HTML 404, the Worker queues `seo.not_found.record` after responding.

Tenant pages (`*`) differ in one way: `RenderMode.Client` builds the head on the server from
`Experience.queries.GetDocument({ path })` and renders the L2 document in the browser (no L2 SSR in v1).

## Tests

| File                                                                 | Tier | Entry                                                          | Proves                                                                                                                    |
| -------------------------------------------------------------------- | ---- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `components/*/__tests__/*.test.tsx`, `blocks/*/__tests__/*.test.tsx` | unit | `@stackra/testing/react`                                       | renders in `en` and `ar` (RTL); consent, theme, prices, accordion semantics, card price and link, each block's props      |
| `hooks/__tests__/`, `providers/site/__tests__/`                      | unit | `renderHook`                                                   | variant axes and matching; `useSite` inside and outside the provider                                                      |
| `routes/__tests__/*.route.test.ts(x)`                                | unit | `renderRoute`, `runRouteLoader`, `runRouteSubmit`, `routeMeta` | loaders, the contact submit, the head                                                                                     |
| `schemas/__tests__/`, `server/__tests__/`                            | unit | `@stackra/testing`                                             | the schema class; the locale rule and one resolution per request                                                          |
| `routes/__tests__/*.e2e.test.ts`                                     | e2e  | `@stackra/testing/e2e`                                         | landing + consent + locale switch; store journey + crawler view; contact with and without JS; axe everywhere, `en` + `ar` |
| `.stackra/lighthouserc.yaml`                                         | e2e  | Lighthouse CI (run by `stackra test --tier e2e`)               | ADR 0183 budgets per route and locale                                                                                     |

## Catalog entries this member needs (root `pnpm-workspace.yaml`)

`@stackra/{analytics,app,brand,clients,config,consent,container,content,contracts,csp,errors,experience,feature-flags,i18n,iam,media,money,navigation,panel,platform,schema,seo,state,theming,ui,validation}`
in `catalog:stackra`; `@heroui/styles` in `catalog:ui`. Vite, the Cloudflare Vite plugin, `@react-router/dev`,
Tailwind, wrangler, isbot, Playwright and Lighthouse CI are dependencies of `@stackra/app`, not of the app.
