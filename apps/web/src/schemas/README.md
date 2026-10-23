# src/schemas

Schema classes (`class X extends Schema`): the field types are the rules, the initializers the
defaults, and gen compiles each class to one Zod schema in `#stackra/schemas` (ADR 0294 decisions 4
and 26), so no Zod is written here except a `@Field(z…)` with its `// reason:`. A shape is built
with `X.create({...})` and checked with `validate(X, raw)`, never `new`-ed. Shared by the routes
(`search`), the form adapter and the route's `submit`, the blocks' nested props and the config
classes, so each shape is declared once.

| File                       | Class           | Used by                                                                 |
| -------------------------- | --------------- | ----------------------------------------------------------------------- |
| `env-options.schema.ts`    | `EnvOptions`    | `config/env.config.ts` `schema`: public, server and secret fields       |
| `site-options.schema.ts`   | `SiteOptions`   | `config/site.config.ts` `schema`                                        |
| `edge-options.schema.ts`   | `EdgeOptions`   | `config/edge.config.ts` `schema`                                        |
| `cache-rule.schema.ts`     | `CacheRule`     | one data cache profile inside `EdgeOptions`                             |
| `contact-input.schema.ts`  | `ContactInput`  | the contact form in the browser and `ContactRoute.submit` on the Worker |
| `contact-search.schema.ts` | `ContactSearch` | `ContactRoute` `search`: the plan, or the product and SKU of an enquiry |
| `store-search.schema.ts`   | `StoreSearch`   | `StoreRoute` `search`: the phrase, the collection and the cursor        |
| `call-to-action.schema.ts` | `CallToAction`  | the hero and banner blocks: a localised label and a route key           |
| `feature.schema.ts`        | `Feature`       | `web.feature_grid` cards                                                |

Telemetry has no shape here: `config/telemetry.config.ts` overrides the logger package's config.
Tests: `__tests__/<name>.schema.test.ts`, pure, no DOM.
