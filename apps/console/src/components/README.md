# src/components

Shared presentational components, one flat folder each (ADR 0294 decision 14):
`<name>/{<name>.tsx, <name>.props.ts?, use-<name>.ts?, index.ts, __tests__/}`, where `index.ts`
exports the component and its Props only. A component is a class, `extends Component<Props>` from
`@stackra/ui`: fields are state, a field that calls a hook is a hook field, methods are handlers,
getters derived values, `mount()` and `unmount()` the lifecycle, `render()` the body; gen compiles
it to a function component. A side effect (an object URL, a subscription) starts in `mount()` and
ends in `unmount()`, never in a field initializer. A hook stays a function and its result type lives
in `src/types/`. A page is not here: it is `<name>.tsx` in its route folder. Every string is a typed
`I18n` key; every UI primitive comes from `@stackra/ui` (HeroUI Pro pieces from
`@heroui-pro/react`), never the kit underneath; every colour is a semantic class fed by the `acme`
theme; layout uses logical classes (`ps-`, `pe-`, `ms-`), never left and right.

| Folder                  | Renders                                                                                              |
| ----------------------- | ---------------------------------------------------------------------------------------------------- |
| `palette/`              | the Cmd+K palette over HeroUI Pro's `Command`: every shortcut the actor may run, plus action intents |
| `notification-inbox/`   | the top bar's bell with the unread count and the inbox sheet; `use-notification-inbox.ts` beside it  |
| `pending-changes/`      | the top bar's queue badge and the sheet that holds the queue list                                    |
| `pending-changes-list/` | the offline queue: queued and conflicting changes, their resolutions, "sync now"                     |
| `offline-banner/`       | the strip under the top bar while the API is unreachable, with the queued-change count               |
| `connection-indicator/` | the realtime dot with a label for assistive tech                                                     |
| `tenant-switcher/`      | the sidebar header's active tenant and the switch between memberships; `use-active-tenant.ts` beside |
| `locale-switcher/`      | the enabled locales, each in its own language; switching flips the direction                         |
| `theme-toggle/`         | cycles the colour schemes through the same `CycleThemeShortcut` the key and the menu run             |
| `attach-images/`        | attaches shared or opened images to a product: previews, a variant picker, one description           |
| `image-previews/`       | the square previews of one image set; its object URLs live from `mount()` to `unmount()`             |
| `empty-view/`           | the one empty state, over HeroUI Pro's `EmptyState`                                                  |
| `error-state/`          | the one error state: a message per refusal kind, a retry where retrying can help                     |
| `loading-state/`        | the one loading state: a skeleton for a region or a centred spinner                                  |

Resource tables, forms and widgets are not here: `@stackra/panel` renders them from the services'
declarations, and a widget renderer the console changes is a shadow in `src/overrides/`. Tests:
`__tests__/<name>.test.tsx` with `render` from `@stackra/testing/react`, in `en` and `ar`.
