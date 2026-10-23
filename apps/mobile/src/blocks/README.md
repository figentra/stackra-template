# src/blocks

Page-builder blocks this app contributes. A block is data-addressable code: tenants place it in
documents by key, the experience service validates its props on publish, and the renderer
re-validates on render and refuses a key nobody registers (ADR 0110 decision 6). Folder shape (ADR
0294 decision 14): `<name>/{<name>.block.ts, <name>.tsx, __tests__/}`, with an optional
`<name>.native.tsx` when a block also has a web renderer. The declaration's fields are the props;
the renderer is bound by file name, so neither imports the other's file.

| Folder          | Class              | Key                   | Renders                                                    |
| --------------- | ------------------ | --------------------- | ---------------------------------------------------------- |
| `promo-banner/` | `PromoBannerBlock` | `mobile.promo_banner` | a headline, body and one call to action (`PromoBannerCta`) |

Gen lists every block in `stackra.manifest.json` (`blocks`) so the page builder offers it, and
checks that every document in `documents/` references registered blocks by class.
