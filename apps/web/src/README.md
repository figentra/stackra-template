# src

The groups of an app (ADR 0294 decision 14); a group folder appears with its first file. The site
writes no root module: it would say nothing gen does not derive, so gen builds the one module `web`
from these folders.

| Folder / file        | Owns                                                                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| `config/`            | config classes: the site's own (`EnvConfig`, `SiteConfig`, `EdgeConfig`) and overrides of packages'   |
| `routes/<name>/`     | one folder per route or layout: `<name>.route.ts` or `.layout.ts`, the page class `<name>.tsx`, tests |
| `components/<name>/` | shared class components with their `<name>.props.ts`, a hook of their own and an `index.ts`           |
| `blocks/<name>/`     | page-builder blocks: the declaration (its props as fields), its renderer and the renderer's Props     |
| `hooks/`             | hooks two or more importers share: `use-site`, `use-variant-choice`                                   |
| `menus/`             | the header (`SiteMenu`) and footer (`FooterMenu`) navigation, kind `MenuKind.Navigation`              |
| `flags/`             | flags: `PricingYearlyFirstFlag` (an experiment), `HelpCentreFlag` (a release switch)                  |
| `analytics/`         | analytics events (`LeadSubmitted`), sent only after consent                                           |
| `schemas/`           | shape classes: the site's three config options, the contact form, query strings, block props          |
| `types/`             | types only: each hook's result and the shapes the renderers receive (`<name>.type.ts`)                |
| `enums/`             | enums only this site uses (`BillingInterval`, `CacheProfile`); a package's enum is imported           |
| `errors/`            | refusals this site raises (`SiteContextMissingError`)                                                 |
| `overrides/<owner>/` | the one tree that changes another member's files, mirroring the owner's path                          |
| `styles/app.css`     | the one stylesheet entry: Tailwind v4, HeroUI v3, the theme fonts and the generated `acme` theme      |

No `providers/`: every context the site needs is a package's, mounted from its config class. No
error boundary: `@stackra/navigation` mounts the root boundary, and a route adds `<name>.error.tsx`
only to customise it. No entry, root, Vite, React Router, wrangler, Playwright or Lighthouse
configuration here: gen writes them into `.stackra/` from `stackra.config.ts`, runway.yaml,
`config/` and the classes above.
