# @acme/web

The public site of a Stackra project: the landing page, pricing, a storefront and the tenant's
page-builder pages, on one hostname per site, in English and Arabic with a US English and a Saudi
Arabic overlay. Every thing with identity is a kind class whose base names its kind and whose path
names its group (ADR 0294): routes and the site layout, page-builder blocks, menus, flags, the
analytics event and config. React components are class components too (`extends Component` from
`@stackra/ui`: fields are state, `use*` fields are hooks, `render()` is the body), which gen
compiles to function components; each is bound to its route or block by file name and keeps its
Props in `<name>.props.ts`. The one piece of request logic the app writes is the site resolution in
the site layout's loader. The member writes no root module: it would say nothing gen does not
derive, so gen builds the one module `web` from the group folders. The runtime (the entries, Vite,
React Router 7 framework mode, the Cloudflare Worker, wrangler, Playwright, Lighthouse) is generated
into `.stackra/`. It reads five services through the public area, each through the named classes of
`#stackra/clients/<service>` (`GetProductBySlugQuery`, `ResolveSiteQuery`), and writes through
exactly two public actions (`leads.lead.create`, `seo.not_found.record`). It owns no data. UI comes
through `@stackra/ui`, like the console, and the look is the `acme` theme of `@acme/theme`.

It is a website, not an installable app: `Target.Web` only. A marketing site and a storefront read
per request have no offline journey (a cart and a checkout need the network), so there is no web app
manifest, service worker or offline page; the console is the installable PWA.

| Command                  | Does                                                                                                |
| ------------------------ | --------------------------------------------------------------------------------------------------- |
| `pnpm gen`               | `stackra gen`: rewrites `.stackra/` from the config, the runway, the kind classes and the manifests |
| `pnpm dev`               | React Router dev on the Workers runtime on the port of `runway.yaml`, HMR on `#stackra/*`           |
| `pnpm build`             | `stackra build --target web`: the client build and the Worker build (render: server)                |
| `pnpm start`             | the built site on `wrangler dev` (what the e2e tier measures)                                       |
| `pnpm test` / `test:e2e` | vitest (jsdom) / Playwright with axe after `build`                                                  |
| `pnpm typecheck`         | gen, then tsc over `src` and `.stackra`                                                             |

## Tree

```text
apps/web
├── stackra.config.ts        defineApp: Target.Web, render: RenderMode.Server, ApiArea.Public, env class, e2e
├── vite.extend.ts           the one code hatch (with its Reason): an extra Vite plugin, merged after the stackra plugin
├── runway.yaml              dev port/host, domains and aliases, public + server vars, secret names, Worker knobs, health
├── stackra.manifest.json    the committed contract: routes, blocks, menus, flag, consumes, forwarding, config keys
├── package.json             three aliases: #src/*, #assets/* and #stackra/*
├── assets/lang/<locale>/    web.json per locale: en and ar complete; en-US and ar-SA hold only the keys that differ
├── .stackra/                GENERATED (see .stackra/README.md); the entries live in .stackra/entry/
└── src/
    ├── config/              one class per fact: env, site, edge and telemetry are the site's own (`Config({ schema })`
    │                        over a shape in schemas/); i18n, theming, seo, consent, analytics, feature-flags and csp
    │                        override a package's config under the base's own name (`extends BaseI18nConfig`)
    ├── routes/<name>/       <name>.route.ts or <name>.layout.ts, <name>.tsx bound by name, __tests__/: landing,
    │                        pricing, contact, store, product, page (with page.fallback.tsx); the site layout
    ├── menus/               Menu classes of kind Navigation: site (the header: groups with sub-navigation, a
    │                        flag-gated item, an external link) and footer (the legal links)
    ├── flags/               Flag classes: pricing-yearly-first (the pricing experiment), help-centre (a release switch)
    ├── analytics/           AnalyticsEvent classes (base from @stackra/events): lead-submitted
    ├── components/<name>/   one class component per folder (`<name>.props.ts`, its own hook, its `__tests__/`, an
    │                        index.ts with the component and its Props): site-header, site-footer, product-card,
    │                        variant-picker, contact-form, consent-banner, locale-switcher, locale-suggestion (offers
    │                        the browser's preferred locale; ADR 0297 d4)
    ├── hooks/               use-site (the site frame and the pricing table), use-variant-choice (product page and picker)
    ├── blocks/<name>/       one folder per block: <name>.block.ts (props as fields), <name>.tsx with <name>.props.ts,
    │                        __tests__/: hero-section, feature-grid, pricing-table, testimonials, faq-section,
    │                        cta-banner, product-grid
    ├── schemas/             shape classes: the four config options, contact, the store and contact query strings,
    │                        call-to-action, feature, the cache rule and the nested telemetry config objects
    ├── types/               resolved-site, site-market, variant, variant-choice, feature-card, call-to-action-link,
    │                        and the hook results (analytics-consent-state, billing-interval-state,
    │                        locale-suggestion-state)
    ├── enums/               app-local enums: billing-interval, cache-profile
    ├── errors/              refusals: site-context-missing
    ├── overrides/<owner>/   what the site changes in code or assets it does not own, at the owner's own path:
    │                        marketing/leads/assets/lang/{en,ar}/leads.json rewords two `leads::` refusals
    └── styles/app.css       Tailwind v4 + HeroUI v3 + the theme fonts and the generated `acme` theme, logical CSS
```

## The two rules every file follows

1. A class's base names its kind and its options are the static declaration gen reads from the
   syntax tree (path, layout, seo, search, render, category, icon, accepts, kind, name); its members
   are behaviour (`loader`, `submit`, `meta`, `items`). Dependencies arrive through the constructor,
   typed by class; the app's `src` uses no container API. Keys, labels and texts that a name already
   gives are derived, never written.
2. Identities are never strings outside their declaration site: queries, actions, refusals, i18n
   keys, flags and assets are the generated constants and classes of `#stackra/*` (a consumed query
   is a named class: `import { ListPlansQuery } from "#stackra/clients/billing"`); icons are Lucide
   `IconName` strings (`icon: "receipt"`); routes are referenced by `Routes.<key>` (a layout, menu,
   page or block never imports a route class), so every link lands in the visitor's locale mount;
   closed value sets are `Enum.of` values.

Config is read with `useConfig(X)` in components (a hook field: `site = useConfig(SiteConfig)`) and
through the constructor in route, layout and menu classes; never as a static. There is no error
boundary in the app: `@stackra/navigation` owns the root one (the 404 page with a way home in the
visitor's mount, the error page with its reference); a route adds `<name>.error.tsx` only to
customise its own.

## Locales

`src/config/i18n.config.ts` lists four locales: `en` (the default, unprefixed), `en-US`, `ar` and
`ar-SA`. A regional locale is an overlay: `assets/lang/en-US/web.json` holds only the US spellings
and `assets/lang/ar-SA/web.json` only the Saudi consent wording (the Personal Data Protection Law);
every other key falls back along the chain the config declares (`ar-SA` → `ar` → `en`). Codes are
BCP 47 (`ar-SA`); each non-default locale is a static mount under its lowercase tag (`/en-us/`,
`/ar/`, `/ar-sa/`), so the URL alone selects the language and nothing redirects on a cookie or a
header. Where the logic lives: the locales, fallbacks and URL strategy are this config;
`@stackra/i18n` merges the catalogues along the chain and formats; gen mounts the routes per locale,
writes hreflang alternates for every locale and fails on a base-language key missing in another base
language.

## Overrides

Everything the site changes in code or assets it does not own lives in one tree,
`src/overrides/<owner>/…`, at the same path as the owner's own file (owner = the package name with
its scope, or `<service>/<module>` for a consumed service module). A file there overrides by where
it sits, with no keyword or suffix: `src/overrides/marketing/leads/assets/lang/ar/leads.json`
rewords two strings of the marketing service's `leads` module, merged key by key over its file. Gen
refuses a key or path the owner does not have. Configuring a package is not overriding it: config
overrides stay in `src/config/`.

## Which file owns which fact

| Fact                                                       | File                                                        | Consumed by                                                   |
| ---------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------- |
| Targets, render mode, area, env class, e2e seeds           | `stackra.config.ts`                                         | every generated file                                          |
| Extra Vite plugins                                         | `vite.extend.ts`                                            | `.stackra/vite.config.ts` (merged last)                       |
| Dev port and host, domains, vars, secret names, Worker     | `runway.yaml`                                               | `vite.config.ts`, `wrangler.jsonc`, Playwright, Lighthouse    |
| The env contract (`VITE_*`, `STACKRA_*`, the secret names) | `src/config/env.config.ts`                                  | `gen/env.ts`, `env.d.ts`, `wrangler.jsonc` vars               |
| Locales, overlays, RTL, fallback chains, URL strategy      | `src/config/i18n.config.ts`                                 | per-locale mounts in `routes.ts`, `<html lang dir>`           |
| Theme (`acme`), schemes, theme colour, tenant colours      | `src/config/theming.config.ts`                              | `root.tsx`, the site frame                                    |
| Preview hosts, fixed site, product sold, signup, docs link | `src/config/site.config.ts`                                 | the site layout, robots, the pricing table, the header menu   |
| Title template, robots groups, sitemap paging, OG, noindex | `src/config/seo.config.ts`                                  | the SEO route modules, `gen/sitemap.ts`, the store route      |
| Consent categories, cookie, policy version, regions        | `src/config/consent.config.ts`                              | the banner and the consent context                            |
| Analytics and flag drivers, consent gating                 | `src/config/analytics.config.ts`, `feature-flags.config.ts` | `gen/wiring.ts`, the contexts `createApp` mounts              |
| Data cache windows per `CacheProfile`, redirects, 404 log  | `src/config/edge.config.ts`                                 | the Workers cache driver, `middleware.ts`, `entry.server.tsx` |
| CSP additions, Report-Only rollout                         | `src/config/csp.config.ts`                                  | `middleware.ts`, root preconnects                             |
| Pages, header and footer navigation, page-builder blocks   | `src/routes/`, `src/menus/`, `src/blocks/`                  | `routes.ts`, `route-modules/`, the experience service         |

## How a request flows

1. Cloudflare's edge (TLS, WAF, rate limit; the root runway's `edge`). Only `/assets/*`, the hashed
   client build, is served without the Worker: wrangler's `run_worker_first` sends every page
   request to it (ADR 0297 d2).
2. `.stackra/entry/worker.ts`: a GET or HEAD with a body is a 400, an alias host goes to the
   canonical domain and a `//` path to its single-slash form (301). Everything else goes to the app
   `createApp` built from the generated wiring: it validates the server env, fills the request's
   typed context (env, container, reporter, and the public clients bound to the request) and runs
   the React Router server build. Any throw is a static 500 page after the reporter has it.
3. The root middleware (`.stackra/middleware.ts`) mints the request's CSP nonce; after the router
   answers it sets the CSP header and, on an HTML page, `Cache-Control: private, no-cache` with no
   `Vary` and no cookie.
4. `SiteLayout.loader`: host → site once per request (`sites.site.resolve`, or `sites.site.get` for
   a fixed site); the locale is the path's static mount (`/`, `/en-us`, `/ar` or `/ar-sa`); the
   market and the tenant's colours come with the site. Every route's `loader` receives `ctx.site`,
   and `ctx.query` for that locale and market.
5. The route class's `loader`: each query names a `CacheProfile`, so its answer is cached in the
   Workers cache under the query, its input, the site, the locale, the market and the version, and
   served stale while one request refreshes it (ADR 0297 d3). The route module builds the head
   through the SEO chain (`seo.config.ts`, the route's `seo`, its `meta`, the tenant's SEO record)
   and derives canonical, hreflang and `noindex`; JSON-LD goes through `@stackra/seo`'s escaper.
6. `.stackra/entry.server.tsx` streams the document with the nonce on every script, inside the
   stream timeout; bots wait for the whole shell.
7. Only when the router answers an HTML 404 does the middleware ask `seo.redirect.resolve`
   (edge-cached, same-site targets only, failing open); with no redirect it queues
   `seo.not_found.record` after responding.

Every call the Worker makes to the API forwards the request's `traceparent`, the visitor's address
signed with an HMAC under `GATEWAY_VISITOR_SIGNING_KEY`, and its `Sec-Purpose` header (ADR 0297 d6);
the gateway verifies the signature before it uses the address.

Two rules hold on every page. A GET for HTML never sets a cookie and never redirects because of a
cookie, `Accept-Language` or the visitor's address: consent (decline by default, Global Privacy
Control counts as a refusal, ADR 0298) and the locale choice are written by the browser after the
visitor acts, so the same URL is the same page for everyone. A visitor whose browser prefers the
other locale gets a suggestion banner, rendered in the browser, that opens the same page in that
locale's mount (ADR 0297 d4). And nothing is prerendered: a prerendered page is one file for every
visitor, so `prerender: true` needs `SiteConfig.fixedSiteId`, which this multi-tenant site leaves
unset.

Tenant pages (`*`) differ in one way: `RenderMode.Client` builds the head on the server from
`GetDocumentQuery` (`{ path }`) and renders the L2 document in the browser after `page.fallback.tsx`
(no L2 SSR in v1).

## Tests

| File                                                                 | Tier | Entry                                                          | Proves                                                                                                                    |
| -------------------------------------------------------------------- | ---- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `components/*/__tests__/*.test.tsx`, `blocks/*/__tests__/*.test.tsx` | unit | `@stackra/testing/react`                                       | renders in `en` and `ar` (RTL); consent, theme, prices, accordion semantics, card price and link, each block's props      |
| `hooks/__tests__/`                                                   | unit | `renderHook`                                                   | variant axes and matching; `useSite` inside and outside the site layout                                                   |
| `routes/<name>/__tests__/*.test.ts(x)`                               | unit | `renderRoute`, `runRouteLoader`, `runRouteSubmit`, `routeMeta` | loaders, the site resolution, the contact submit, the head, each page                                                     |
| `schemas/__tests__/`                                                 | unit | `@stackra/testing`                                             | the contact shape                                                                                                         |
| `routes/<name>/__tests__/*.e2e.test.ts`                              | e2e  | `@stackra/testing/e2e`                                         | landing, consent, locale switch, no cookie on GET HTML; store and crawler view; contact with and without JS; axe, en + ar |
| `.stackra/lighthouserc.yaml`                                         | e2e  | Lighthouse CI (run by `stackra test --tier e2e`)               | ADR 0183 budgets per route and locale                                                                                     |

## Catalog entries this member needs (root `pnpm-workspace.yaml`)

Runtime:
`@stackra/{analytics,app,assets,cache,clients,config,consent,container,content,contracts,csp,errors,events,experience,feature-flags,i18n,iam,icons,media,money,navigation,platform,seo,state,theming,tokens,ui,validation}`
in `catalog:stackra` (`@acme/theme` is the workspace package); `react`, `react-dom`, `react-router`,
`isbot` and `zod` in the default catalog; `@heroui/styles` in `catalog:ui`; `tailwindcss` in
`catalog:frontend`.

Development: `@stackra/{cli,runway,testing,vite-plugin}` in `catalog:stackra`; the workspace presets
`@stackra/{typescript,vitest}-config`; `@types/{node,react,react-dom}` in the default catalog;
`@react-router/dev`, `typescript` and `vite` in `catalog:build`; `@lhci/cli`, `@playwright/test`,
`jsdom`, `oxfmt`, `oxlint` and `vitest` in `catalog:quality`. The Cloudflare Vite plugin and
wrangler are dependencies of `@stackra/app`.
