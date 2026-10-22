# @stackra/brand

Design tokens and the brand mark, at `packages/cross-cutting/brand` (`tier:lib`, category
`cross-cutting`). It is here, not under `experience`, because brand is read by web, native, mail
templates and the docs alike, so it is cross-cutting. No React: components that use the tokens live
in `@stackra/ui`. Nothing here has identity, so the class-and-decorator rule (ADR 0094) does not apply:
tokens stay a constant.

**One token source.** The TypeScript token files are the only place a value is written.
`css/tokens.css` and `css/native.css` are generated from them (`stackra gen`), and every custom
property is named `--brand-<group>-<name>` (`--brand-color-accent`, `--brand-radius-md`,
`--brand-font-sans`). A consumer references only those names, never a literal and never a name this
package does not generate.

## Shapes index

| Kind              | Folder                | Suffix         | Example                                          | Test |
| ----------------- | --------------------- | -------------- | ------------------------------------------------ | ---- |
| tokens (constant) | `src/core/tokens/`    | `.token.ts`    | `core/tokens/color.token.ts`                     | none |
| type              | `src/core/types/`     | `.type.ts`     | `core/types/brand-tokens.type.ts`                | none |
| function          | `src/core/functions/` | `.function.ts` | `core/functions/brand-css-variables.function.ts` | none |
| public asset      | `assets/public/`      | any            | `assets/public/images/mark.svg`                  | none |
| barrel            | `src/`                | `index.ts`     | `src/index.ts`                                   | none |

| Path                                                 | Holds                                                                                                                                            |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/core/tokens/color.token.ts`                     | `COLOR_TOKENS`: dotted key to a light and a dark `oklch()` value                                                                                 |
| `src/core/tokens/radius.token.ts`                    | `RADIUS_TOKENS`                                                                                                                                  |
| `src/core/tokens/font.token.ts`                      | `FONT_TOKENS`: the `font-family` stacks, family names only; no font file ships with the package                                                  |
| `src/core/types/brand-tokens.type.ts`                | `BrandToken` and `BrandTokens`; a tenant's brand is `Partial<BrandTokens>`                                                                       |
| `src/core/functions/brand-css-variables.function.ts` | `brandCssVariables(tokens: Partial<BrandTokens>): string`, a pure string function a server inlines as `<style>`                                  |
| `assets/public/images/mark.svg`                      | the mark, published to the CDN as `Assets.brand.public.mark_svg` (`brand::public/images/mark.svg`, ADR 0234)                                     |
| `css/tokens.css`                                     | generated: the tokens as CSS custom properties for the web and the console (`@import "@stackra/brand/css/tokens.css"`), light and dark           |
| `css/native.css`                                     | generated: the same tokens for the mobile app, plus HeroUI Native's theme variables mapped onto them (`@import "@stackra/brand/css/native.css"`) |

Exports are explicit: `.`, `./css/tokens.css`, `./css/native.css`, `./assets/*`.

The `#stackra/*` imports key is kept for the same key set in every member; `stackra gen` writes nothing under
`.stackra/gen` for brand, so the folder does not exist here.

Publishing: `publishConfig` (with `exports` pointing at `dist`) plus a changeset; a package has no
`runway.yaml`.
