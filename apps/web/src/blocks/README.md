# src/blocks

Page-builder blocks this site contributes. A block is data-addressable code: tenants place it in
documents by key, the experience service validates its props on publish, and the renderer
re-validates on render and refuses a key nobody registers (ADR 0110 decision 6). Folder shape (ADR
0294 decision 14): `<name>/{<name>.block.ts, <name>.tsx, <name>.props.ts, __tests__/}`. The
declaration's fields are the props a document may pass; `accepts` names the query whose output the
renderer receives as `data`, batched per page; the renderer is a class component bound by file name,
so neither imports the other's file.

| Folder           | Class               | Key                 | Renders                                               |
| ---------------- | ------------------- | ------------------- | ----------------------------------------------------- |
| `hero-section/`  | `HeroSectionBlock`  | `web.hero_section`  | the headline, the line and one or two calls to action |
| `feature-grid/`  | `FeatureGridBlock`  | `web.feature_grid`  | feature cards (`Feature`: icon, title, line)          |
| `pricing-table/` | `PricingTableBlock` | `web.pricing_table` | the plan ladder (`ListPlansQuery`) with the interval  |
| `testimonials/`  | `TestimonialsBlock` | `web.testimonials`  | quotes from the content service (`ListEntriesQuery`)  |
| `faq-section/`   | `FaqSectionBlock`   | `web.faq_section`   | an accordion of questions (`ListEntriesQuery`)        |
| `cta-banner/`    | `CtaBannerBlock`    | `web.cta_banner`    | a title, a line and one button on an accent surface   |
| `product-grid/`  | `ProductGridBlock`  | `web.product_grid`  | storefront cards (`ListStorefrontProductsQuery`)      |

Gen lists every block in `stackra.manifest.json` (`ui.blocks`), so the page builder offers it; a
renamed block keeps its documents through `renamedFrom`.
