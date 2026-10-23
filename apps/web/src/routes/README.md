# src/routes

Each route is a folder `routes/<name>/` holding `<name>.route.ts` (`extends Route({...})`, or
`<name>.layout.ts` with `extends Layout`), the page `<name>.tsx` bound by name, and `__tests__/`
(ADR 0294 decisions 14 and 16). The class is static options plus behaviour (`loader`, `submit`,
`meta`); the page is a class component typed `extends Component<RouteProps<typeof X>>` that imports
its route as a type only. Gen turns each class into one React Router 7 framework-mode module in
`.stackra/route-modules/`, mounts it once per locale (`/`, `/en-us`, `/ar`, `/ar-sa`) and writes
`#stackra/routes` (typed `Routes.<key>` refs). A hand-written route config is banned.

| Folder     | Class          | Path           | Shows                                                                          |
| ---------- | -------------- | -------------- | ------------------------------------------------------------------------------ |
| `site/`    | `SiteLayout`   | every page     | resolves the site from the host once per request; the frame, header and footer |
| `landing/` | `LandingRoute` | `/`            | the coded landing page made of the site's blocks                               |
| `pricing/` | `PricingRoute` | `/pricing`     | the plan ladder of the billing service, behind the yearly-first experiment     |
| `store/`   | `StoreRoute`   | `/store`       | the storefront listing with search, collection filter and cursor paging        |
| `product/` | `ProductRoute` | `/store/:slug` | gallery, variant picker and price; the enquiry link to the contact page        |
| `contact/` | `ContactRoute` | `/contact`     | the contact form; `submit` verifies the captcha and creates a lead             |
| `page/`    | `PageRoute`    | `*`            | a tenant's published page: head on the server, document in the browser         |

| Option   | Meaning                                                                                       |
| -------- | --------------------------------------------------------------------------------------------- |
| `path`   | absolute, with a leading slash; gen mounts it under every locale prefix                       |
| `layout` | the layout class the route renders inside (`SiteLayout` everywhere)                           |
| `search` | a schema class from `schemas/`; gen types `ctx.search` and the page's `search`, drops garbage |
| `seo`    | the static head (a title key); `meta()` adds what depends on the loader data                  |
| `render` | `RenderMode.Client` renders the page in the browser after `<name>.fallback.tsx`               |

Every link is a `Routes.<key>` ref, so it lands in the visitor's locale mount; a layout, menu, page
or block never imports a route class. Each query a loader makes names a `CacheProfile`, so its
answer is cached per query, input, site, locale and market, never as HTML. Tests: `<name>.test.tsx`
renders the page with route props, `<name>.route.test.ts` runs the loader, `submit` and `meta`
(`runRouteLoader`, `runRouteSubmit`, `routeMeta`), and `<name>.e2e.test.ts` is the Playwright
journey with axe in `en` and `ar`.
