# src/components

Two kinds of folder, both in the shape of ADR 0128 d2 (`x/{x.tsx, index.ts, __tests__/x.test.tsx}`,
a single-use hook as `use-*.ts` beside its component). Components are functions referenced from
decorator options; they never carry a decorator themselves. Every string is a typed `I18n` key;
every UI primitive comes from `@stackra/ui/native` (never the kit underneath); every colour is a
semantic class fed by the brand tokens; layout uses logical classes (`ps-`, `pe-`), never
left/right.

## `ui/` — shared presentational components

| Folder               | Renders                                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `screen/`            | the scroll container every page uses (insets under the glass header and tab bar)                                    |
| `glass/`             | a Liquid Glass panel with a plain-surface fallback                                                                  |
| `screen-state/`      | loading, empty and error states, one component with a `kind`                                                        |
| `offline-banner/`    | the offline strip with the pending-mutation count and a retry; `use-offline-queue.ts` beside it                     |
| `order-card/`        | one order in the list: id, status chip from the producer's enum, total; long press opens `menus/order-card.menu.ts` |
| `revenue-sparkline/` | the native tile bound to the orders module's `RevenueSparkline` override point (`overrides/orders/components/`)     |

## `pages/` — page-level components

One per route, `<name>.tsx` exporting `<Name>Page: RouteComponent<typeof <Name>Route>` (props
`data`, `params`, `search` typed from the route's document, loader and params; the route is imported
as a type only, so there is no runtime cycle). The hook a page owns is `use-<name>.ts` beside it; a
hook two pages share moves to `src/hooks/`. "Page" is never a kind folder: the word names the
component kind under `components/`.

| Folder                      | Route                          | Own hook                            |
| --------------------------- | ------------------------------ | ----------------------------------- |
| `home/`                     | `HomeRoute`                    | —                                   |
| `orders/`                   | `OrdersRoute`                  | `use-orders.ts`                     |
| `order-detail/`             | `OrderDetailRoute`             | `use-order-detail.ts`               |
| `create-order/`             | `CreateOrderRoute`             | `use-create-order.ts`               |
| `scan/`                     | `ScanRoute`                    | `use-barcode-scan.ts`               |
| `document/`                 | `AnnouncementsRoute`           | —                                   |
| `inbox/`                    | `InboxRoute`                   | `use-inbox.ts`                      |
| `notification-preferences/` | `NotificationPreferencesRoute` | —                                   |
| `settings/`                 | `SettingsRoute`                | — (`consent-section.tsx` beside it) |
| `profile/`                  | `ProfileRoute`                 | —                                   |
| `sign-in/`                  | `SignInRoute`                  | —                                   |

Tests: `__tests__/<name>.test.tsx` with `renderRoute(Routes.<key>, options)` (`#stackra/routes`) from
`@stackra/testing/native`, which mounts the route (guards, params, prefetch and document against
faked clients) and its page under the testing providers.
