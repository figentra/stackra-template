# src/components

Shared presentational components, one flat folder each (ADR 0294 decision 14):
`<name>/{<name>.tsx, <name>.props.ts?, use-<name>.ts?, index.ts, __tests__/}`, where `index.ts`
exports the component and its Props only. A component is a class, `extends Component<Props>` from
`@stackra/ui`: fields are state, a field that calls a hook is a hook field, methods are handlers,
getters derived values, `render()` the body; gen compiles it to a function component. A hook stays a
function and its result type lives in `src/types/`. A page is not here: it is `<name>.tsx` in its
route folder. Every string is a typed `I18n` key; every UI primitive comes from `@stackra/ui`; every
colour is a semantic class fed by the `acme` theme; layout uses logical classes (`ps-`, `pe-`).

| Folder               | Renders                                                                                       |
| -------------------- | --------------------------------------------------------------------------------------------- |
| `site-header/`       | the header: logo, `SiteMenu` with its groups, the locale switcher and the colour scheme       |
| `site-footer/`       | the footer: the copyright line and `FooterMenu`'s legal links                                 |
| `product-card/`      | one product in a grid: image, title, price in the market currency, stock                      |
| `variant-picker/`    | one select per option axis over the shared variant choice                                     |
| `contact-form/`      | the progressively enhanced contact form, prefilled by a product enquiry                       |
| `consent-banner/`    | the cookie banner, read and written in the browser only; `use-analytics-consent.ts` beside it |
| `locale-switcher/`   | the same page in another locale's mount                                                       |
| `locale-suggestion/` | offers the browser's preferred locale once; `use-locale-suggestion.ts` beside it              |

Tests: `__tests__/<name>.test.tsx` with `render` from `@stackra/testing/react`, in `en` and in `ar`
(RTL) where the component has text.
