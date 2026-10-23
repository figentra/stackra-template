# src/components

Shared presentational components, one flat folder each (ADR 0294 decision 14):
`<name>/{<name>.tsx, <name>.props.ts?, use-<name>.ts?, index.ts, __tests__/}`, where `index.ts`
exports the component and its Props only. A component is a class, `extends Component<Props>` from
`@stackra/ui/native`: fields are state, a field that calls a hook is a hook field, methods are
handlers, getters derived values, `render()` the body; gen compiles it to a function component. A
hook stays a function and its result type lives in `src/types/`. A page is not here: it is
`<name>.tsx` in its route folder. Every string is a typed `I18n` key; every UI primitive comes from
`@stackra/ui/native` (never the kit underneath); every colour is a semantic class fed by the `acme`
theme; layout uses logical classes (`ps-`, `pe-`), never left and right.

| Folder             | Renders                                                                                                  |
| ------------------ | -------------------------------------------------------------------------------------------------------- |
| `screen/`          | the scroll container every page uses (insets under the glass header and the tab bar)                     |
| `glass/`           | a Liquid Glass panel with a plain-surface fallback                                                       |
| `screen-state/`    | loading, empty and error states, one component with a `kind`                                             |
| `offline-banner/`  | the offline strip with the pending-mutation count and a retry; `use-offline-banner.ts` beside it         |
| `order-card/`      | one order in the list: id, status chip from the producer's enum, total; long press opens `OrderCardMenu` |
| `consent-section/` | the settings page's privacy switches, one per consent category                                           |

The revenue tile of the dashboard is not here: the orders module's widget renders through the
panel's built-in KPI display. Tests: `__tests__/<name>.test.tsx` with `render` from
`@stackra/testing/native`.
