# src/components

Shared presentational components, one flat folder each (ADR 0294 decision 14):
`<name>/{<name>.tsx, use-<name>.ts?, index.ts, __tests__/}`, where `index.ts` exports the component
and its Props only. Components are functions; they never carry a decorator or a base class. A page
is not here: it is `<name>.tsx` in its route folder. Every string is a typed `I18n` key; every UI
primitive comes from `@stackra/ui/native` (never the kit underneath); every colour is a semantic
class fed by the brand tokens; layout uses logical classes (`ps-`, `pe-`), never left and right.

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
