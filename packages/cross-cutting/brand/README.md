# @acme/brand

Design tokens and the brand mark, at `packages/cross-cutting/brand` (`tier:lib`, category
`cross-cutting`). It is here, not under `experience`, because brand is read by web, native, mail
templates and the docs alike, so it is cross-cutting. No React: components that use the tokens live
in `@stackra/ui`. The tokens are plain constants, not kinds; the package's one class is its root
module, which owns the `brand` key (ADR 0294, rule R12).

**One token source.** The token constants in `src/core/constants/` are the only place a value is
written. `css/tokens.css` and `css/native.css` are generated from them (`stackra gen`), and every
custom property is named `--brand-<group>-<name>` (`--brand-color-accent`, `--brand-radius-md`,
`--brand-font-sans`). A consumer references only those names, never a literal and never a name this
package does not generate.

**Names are the contract.** `src/contracts/types/` declares the token names; each constant
`satisfies` a record of its name union, so a name without a value, or a value without a name, is a
type error.

## Layout

| Path                                                 | Holds                                                                                                                                                                                        |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `stackra.config.ts`                                  | `definePackage({})`: the key, entries and root module are all derived                                                                                                                        |
| `stackra.manifest.json`                              | the committed contract: the module key and the asset it serves                                                                                                                               |
| `src/contracts/types/*.type.ts`                      | `ColorToken`, `RadiusToken`, `FontToken`, `BrandToken` and `BrandTokens`; a tenant's brand is `Partial<BrandTokens>`                                                                         |
| `src/core/constants/color-tokens.constant.ts`        | `COLOR_TOKENS`: dotted key to a light and a dark `oklch()` value                                                                                                                             |
| `src/core/constants/radius-tokens.constant.ts`       | `RADIUS_TOKENS`                                                                                                                                                                              |
| `src/core/constants/font-tokens.constant.ts`         | `FONT_TOKENS`: the `font-family` stacks, family names only; no font file ships with the package                                                                                              |
| `src/core/functions/brand-css-variables.function.ts` | `brandCssVariables(tokens: Partial<BrandTokens>): string`, a pure string function a server inlines as `<style>`; it throws on a key it does not declare or a value outside the token grammar |
| `src/core/functions/brand-variable-name.function.ts` | `brandVariableName(token)`: the one place the `--brand-<group>-<name>` rule lives                                                                                                            |
| `src/node/brand.module.ts`                           | `BrandModule`, the root module; a host imports it only to serve the mark through the `brand::` asset namespace                                                                               |
| `assets/public/images/mark.svg`                      | the mark, published to the CDN as `Assets.brand.public.mark_svg` (`brand::public/images/mark.svg`, ADR 0234)                                                                                 |
| `css/tokens.css`                                     | generated: the tokens as CSS custom properties for the web and the console (`@import "@acme/brand/css/tokens.css"`), light and dark                                                          |
| `css/native.css`                                     | generated: the same tokens for the mobile app, plus HeroUI Native's theme variables mapped onto them (`@import "@acme/brand/css/native.css"`)                                                |

## Entries

| Entry              | Holds                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------- |
| `.`                | `COLOR_TOKENS`, `RADIUS_TOKENS`, `FONT_TOKENS`, `brandCssVariables`, `brandVariableName` |
| `./contracts`      | the token types                                                                          |
| `./node`           | `BrandModule`                                                                            |
| `./css/tokens.css` | the web and console stylesheet                                                           |
| `./css/native.css` | the mobile stylesheet                                                                    |
| `./assets/*`       | the mark                                                                                 |

No symbol is exported from two entries. Nobody writes an entry barrel: gen writes
`.stackra/entry/{index,contracts,node}.ts`, and `package.json` `exports` point at them. The tsdown
and Vitest configs are generated into `.stackra/` too, with gitignored shims at the member root.

Publishing: `publishConfig` (with `exports` pointing at `dist`) plus a changeset; a package has no
`runway.yaml`.
