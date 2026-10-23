# src/schemas

Schema classes (`class X extends Schema`, or a derived shape such as `PickType` of a generated
client class or `Settings.pick` of the generated settings): the field types are the rules, the
initializers the defaults, and gen compiles each class to one Zod schema in `#stackra/schemas` (ADR
0294 decisions 4 and 26), so no Zod is written here. A shape is built with `X.create({...})` and
checked with `validate(X, raw)`, never `new`-ed. Shared by the routes, the form adapter, the page
hooks and the block's nested props, so each shape is declared once; a field the producer already
declares is derived, never re-typed.

| File                            | Class               | Used by                                                                      |
| ------------------------------- | ------------------- | ---------------------------------------------------------------------------- |
| `env-options.schema.ts`         | `EnvOptions`        | `config/env.config.ts` `schema`: every public env value of the console       |
| `quick-order-form.schema.ts`    | `QuickOrderForm`    | the quick-order form: `CreateOrderInput`'s `lines` plus the points to redeem |
| `attach-images-form.schema.ts`  | `AttachImagesForm`  | the attach-images form: the product and one description for every image      |
| `device-prefs.schema.ts`        | `DevicePrefs`       | the settings page's device and privacy tabs, kept in the prefs store         |
| `tenant-settings.schema.ts`     | `TenantSettings`    | the settings page's tenant tab, picked from the generated settings metadata  |
| `welcome-hero-action.schema.ts` | `WelcomeHeroAction` | `blocks/welcome-hero` `action`: a label key and the route key it opens       |

Telemetry has no schema here: `config/telemetry.config.ts` overrides the logger package's config,
whose shape is the package's. Tests: `__tests__/<name>.schema.test.ts`, pure, no DOM.
