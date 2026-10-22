# src/blocks

`@Block` classes and their components (every app that contributes page-builder blocks has a
`blocks/`). A block is data-addressable code: tenants place it in L2 documents by key, the
experience service validates its props on publish, the renderer re-validates on render and refuses a
key nobody registers (ADR 0110 d6). Folder shape: `<name>/{<name>.block.ts, <name>.tsx, index.ts,
__tests__/}`.

| Folder          | Key                   | Props schema                     | Renders                                             |
| --------------- | --------------------- | -------------------------------- | --------------------------------------------------- |
| `promo-banner/` | `mobile.promo_banner` | `schemas/promo-banner.schema.ts` | a headline, body and one closed-verb call to action |

Gen lists every block in `.stackra/app-manifest.json` (`blocks`) so the page builder offers it, and
checks that every document in `documents/` references registered blocks by class.
