# @acme/web

The public site of a Stackra project: the landing page, pricing, a storefront and the tenant's page-builder pages, on
one hostname per site, in English and Arabic, written in the decorator model (ADR 0094): routes and the layout are
decorated classes (`@Route`, `@Layout`), page-builder blocks are `@Block` classes, config is `@Config` classes, and the
one piece of request logic the app writes is the site resolution beside the site context. The runtime (Vite, React
Router 7 framework mode, the Cloudflare Worker,
wrangler, Playwright, Lighthouse) is generated into `.stackra/`. It reads five services through the public area and
writes through exactly two public actions (`leads.lead.create`, `seo.not_found.record`). It owns no data. UI comes
through `@stackra/ui`, like the console.

| Command                  | Does                                                                                                     |
| ------------------------ | -------------------------------------------------------------------------------------------------------- |
| `pnpm gen`               | `stackra gen`: rewrites `.stackra/` from the config, the runway, the decorated classes and the manifests |
| `pnpm dev`               | React Router dev on the Workers runtime on the port of `runway.yaml`, HMR on `#stackra/*`                |
| `pnpm build`             | `stackra build --target web`: client + server build (render: server), prerender per locale               |
| `pnpm start`             | the built site on `wrangler dev` (what the e2e tier measures)                                            |
| `pnpm test` / `test:e2e` | vitest (jsdom) / Playwright with axe after `build`                                                       |
| `pnpm typecheck`         | gen, then tsc over `src`, `.stackra`                                                                     |

## Tree

```text
apps/web
├── stackra.config.ts        defineApp: key, root class, Target.Web + Target.Pwa, render: RenderMode.Server, ApiArea.Public, env class, e2e seeds
├── vite.extend.ts           the one build hatch: extra Vite plugin instances, merged after the stackra plugin
├── runway.yaml              dev port/host, domains and aliases, public + server vars, secret names, Worker knobs, health
├── package.json             three aliases: #src/*, #assets/* and #stackra/*
├── .stackra/                GENERATED (see .stackra/README.md); app-manifest.json committed
└── src/
    ├── web.app.ts           @App: provider order (site from the layout, toasts)
    ├── config/              one @Config class per fact: env, i18n, theming, site, seo, consent, analytics,
    │                        feature-flags, telemetry, edge, csp
    ├── routes/              @Route classes (landing, pricing, contact, store, product, page) and the @Layout (site)
    ├── menus/               @Menu classes: site (the header navigation) and footer (the legal links), by route key
    ├── flags/               @Flag classes: pricing-yearly-first (the pricing experiment)
    ├── analytics/           @AnalyticsEvent classes: lead-submitted
    ├── components/
    │   ├── pages/<name>/    page components typed RouteComponent<typeof XRoute>
    │   └── <name>/          site-frame, site-header, product-card, variant-picker, … with their single-use hooks
    ├── hooks/               use-variant-choice (product page + variant picker)
    ├── providers/site/      site.context.tsx (the context and SiteContextProvider), use-site.ts and resolve-site.ts
    │                        (host → site once per request; the layout's `resolve` calls it)
    ├── blocks/<name>/       one folder per block: <name>.block.ts (@Block), <name>.tsx, index.ts, __tests__/:
    │                        hero-section, feature-grid, pricing-table, testimonials, faq-section, cta-banner, product-grid
    ├── schemas/             one schema class per file: contact, the store and contact query strings, call-to-action
    │                        and each block's props
    ├── enums/               app-local class enums: billing-interval, cache-profile
    ├── errors/              typed errors: site-context-missing
    └── styles/app.css       Tailwind v4 + HeroUI v3 + the generated brand tokens, logical CSS, light and dark
assets/overrides/leads/      {en,ar}.json: this site's wording of two `leads::` strings
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
| Preview hosts, fixed site, product sold, signup path      | `src/config/site.config.ts`                                 | `providers/site/resolve-site.ts`, robots, the pricing table      |
| Title template, robots groups, sitemap paging, OG, noindex | `src/config/seo.config.ts`                                 | the SEO route modules, `gen/sitemap.ts`, the store route          |
| Consent categories, cookie, policy version                | `src/config/consent.config.ts`                              | the generated root, the banner                                   |
| Analytics and flag drivers, consent gating                | `src/config/analytics.config.ts`, `feature-flags.config.ts` | `gen/wiring.ts`, the generated root                              |
| Cache rules per `CacheProfile`, redirects, 404 log        | `src/config/edge.config.ts`                                 | `workers/app.ts`, `entry.server.tsx`, each route's headers       |
| CSP additions, Report-Only rollout                        | `src/config/csp.config.ts`                                  | `workers/app.ts`, root preconnects                               |
| Pages, header and footer navigation, page-builder blocks  | `src/routes/`, `src/menus/`, `src/blocks/`                  | `routes.ts`, `route-modules/`, the experience service            |

## How a request flows

1. Cloudflare's edge (TLS, WAF, rate limit, static assets of the client build; the root runway's `edge`).
2. `.stackra/workers/app.ts`: a GET or HEAD with a body is a 400, an alias host goes to the canonical domain and a `//`
   path to its single-slash form (301); the Worker mints the request's CSP nonce and hands the request to the router
   with the env, the app, the nonce and the clients factory as the load context. Any throw is a static 500 page after
   the reporter has it.
3. `SiteLayout.resolve`: host → site once per request (`sites.site.resolve`); the locale is the path prefix; the market and
   brand come with the site. Every route's `loader` receives `ctx.site` and `ctx.query` for that locale and market.
4. The route class's `loader`; the route module builds the head through the SEO default chain (`seo.config.ts`, the
   route's `title`, its `meta`, the tenant's SEO record) and derives canonical, hreflang and `noindex`; the `cache:`
   option names an `edge.config.ts` profile and becomes the `Cache-Control` header.
5. `.stackra/entry.server.tsx` streams the document with the nonce on every script, inside the stream timeout; bots wait
   for the whole shell.
6. Only when the router answers an HTML 404 does the Worker ask `seo.redirect.resolve` (edge-cached, same-site targets
   only, failing open); with no redirect it queues `seo.not_found.record` after responding.

One rule holds on every page: a GET for HTML never sets a cookie. Consent and the locale choice are written by the
browser after the visitor acts, so every page stays cacheable and a first visit stores nothing; the e2e tier asserts it.

Tenant pages (`*`) differ in one way: `RenderMode.Client` builds the head on the server from
`Experience.queries.GetDocument({ path })` and renders the L2 document in the browser (no L2 SSR in v1).

## Tests

| File                                                                 | Tier | Entry                                                          | Proves                                                                                                                    |
| -------------------------------------------------------------------- | ---- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `components/*/__tests__/*.test.tsx`, `blocks/*/__tests__/*.test.tsx` | unit | `@stackra/testing/react`                                       | renders in `en` and `ar` (RTL); consent, theme, prices, accordion semantics, card price and link, each block's props      |
| `hooks/__tests__/`, `providers/site/__tests__/`                      | unit | `renderHook`                                                   | variant axes and matching; `useSite` inside and outside the provider                                                      |
| `routes/__tests__/*.route.test.ts(x)`                                | unit | `renderRoute`, `runRouteLoader`, `runRouteSubmit`, `routeMeta` | loaders, the contact submit, the head                                                                                     |
| `schemas/__tests__/`, `providers/site/__tests__/`                    | unit | `@stackra/testing`                                             | the schema class; `useSite`; one site resolution per request                                                              |
| `routes/__tests__/*.e2e.test.ts`                                     | e2e  | `@stackra/testing/e2e`                                         | landing, consent, locale switch, no cookie on GET HTML; store and crawler view; contact with and without JS; axe, en + ar  |
| `.stackra/lighthouserc.yaml`                                         | e2e  | Lighthouse CI (run by `stackra test --tier e2e`)               | ADR 0183 budgets per route and locale                                                                                     |

## Catalog entries this member needs (root `pnpm-workspace.yaml`)

Runtime: `@stackra/{analytics,app,clients,config,consent,container,content,contracts,csp,errors,experience,feature-flags,i18n,iam,media,money,navigation,panel,platform,schema,seo,state,theming,ui,validation}`
in `catalog:stackra` (`@acme/brand` is the workspace package); `react`, `react-dom`, `react-router` and `isbot` in
the default catalog; `@heroui/styles` in `catalog:ui`; `tailwindcss` in `catalog:frontend`.

Development: `@stackra/{cli,runway,testing,vite-plugin}` in `catalog:stackra`; the workspace presets
`@stackra/{typescript,vitest}-config`; `@types/{node,react,react-dom}` in the default catalog; `@react-router/dev`,
`typescript` and `vite` in `catalog:build`; `@lhci/cli`, `@playwright/test`, `jsdom`, `oxfmt`, `oxlint` and `vitest`
in `catalog:quality`. The Cloudflare Vite plugin and wrangler are dependencies of `@stackra/app`.
