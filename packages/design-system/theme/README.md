# @acme/theme

The example product's brand as a theme of the Stackra Design System (Stackra ADR 0302), at
`packages/design-system/theme` (`tier:lib`, category `design-system`). It replaces the retired
`@acme/brand` package: the colours, fonts and radius it held are now one `defineTheme` value built
on the default `stackra` theme of `@stackra/tokens`, and the stylesheets apps import are that
value's rendered output. No React and no components: those are `@stackra/ui`.

**One source.** `ACME_THEME` in `src/core/constants/acme-theme.constant.ts` is the only place a
value is written. It spreads `STACKRA_THEME` and names only what Acme changes: the blue accent (also
the focus ring and links), warm paper and cool ink, the muted text, the amber warning with ink text
on it, Geist and IBM Plex Sans Arabic, and a 0.5rem radius. Every other role, the type scale,
spacing, shadows and motion are the stackra theme's. Colours are oklch; each hex is derived with
`oklchToHex`, never typed.

**Rendered, committed, checked.** `assets/public/themes/acme/web.css` (HeroUI v3 variables, light on
`:root` and `[data-theme="light"]`, dark on `.dark` and `[data-theme="dark"]`) and `native.css` (the
Uniwind theme HeroUI Native reads, `@variant light` and `@variant dark`) are `renderWebCss` and
`renderNativeCss` of `ACME_THEME`. The test compares both files with the renderers byte for byte and
holds every text pair to WCAG AA (4.5:1) in both modes. After a theme change, regenerate:

```sh
pnpm --filter @acme/theme exec vitest run -u
```

## Use

```css
/* Web (apps/console, apps/web): after HeroUI, outside any cascade layer */
@import "tailwindcss";
@import "@heroui/styles";
@import "@stackra/tokens/fonts/fonts.css";
@import "@acme/theme/themes/acme/web.css";
```

```css
/* Native (apps/mobile global.css): the Uniwind entry, after HeroUI Native */
@import "tailwindcss";
@import "uniwind";
@import "heroui-native/styles";
@import "@acme/theme/themes/acme/native.css";
```

A component reads the HeroUI role variables (`--accent`, `--foreground`, `--radius`), never a
literal colour. A server that needs the values (an email template, a PDF) imports `ACME_THEME` and
reads `colors.accent.hexLight`.

## Layout

| Path                                         | Holds                                                                                      |
| -------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `stackra.config.ts`                          | `definePackage({})`: the key and the entries are derived; no root module is authored       |
| `stackra.manifest.json`                      | the committed contract: the generated module, the theme and its stylesheets, the asset     |
| `src/core/constants/acme-theme.constant.ts`  | `ACME_THEME`, the one source                                                               |
| `src/core/constants/__tests__/`              | the stylesheet equality and contrast test                                                  |
| `assets/public/themes/acme/{web,native}.css` | the rendered stylesheets, committed so apps can `@import` them                             |
| `assets/public/images/mark.svg`              | the Acme mark, served as `theme::public/images/mark.svg` (ADR 0234), under `assets/NOTICE` |

## Entries

| Entry        | Holds                                                                                    |
| ------------ | ---------------------------------------------------------------------------------------- |
| `.`          | `ACME_THEME`                                                                             |
| `./node`     | `ThemeModule`, which gen writes because the package authors no module; it owns `theme::` |
| `./themes/*` | `acme/web.css`, `acme/native.css`                                                        |
| `./assets/*` | the mark and its `NOTICE`                                                                |

The theme schema types (`Theme`, `ColorToken`, `ColorRole`) come from `@stackra/tokens/contracts`;
this package declares none of its own. Nobody writes an entry barrel: gen writes
`.stackra/entry/{index,node}.ts`, and `package.json` `exports` point at them. The fonts ship in
`@stackra/tokens` with their SIL Open Font License texts. Publishing: `publishConfig` (with
`exports` pointing at `dist`) plus a changeset; a package has no `runway.yaml`.
