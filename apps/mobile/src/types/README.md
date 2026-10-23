# src/types

Types only, one exported declaration per file (`<name>.type.ts`): what a hook returns, and the
unions those results use. A hook stays a plain function in its route or component folder
(`use-<name>.ts`); its result type sits here so the hook file holds one declaration and the page
class that reads it imports the type without importing the hook's module graph.

| File                           | Type                 | Returned by        | Read by                |
| ------------------------------ | -------------------- | ------------------ | ---------------------- |
| `offline-banner-state.type.ts` | `OfflineBannerState` | `useOfflineBanner` | `OfflineBanner`        |
| `create-order-state.type.ts`   | `CreateOrderState`   | `useCreateOrder`   | the `CreateOrder` page |
| `inbox-state.type.ts`          | `InboxState`         | `useInbox`         | the `Inbox` page       |
| `order-detail-state.type.ts`   | `OrderDetailState`   | `useOrderDetail`   | the `OrderDetail` page |
| `orders-state.type.ts`         | `OrdersState`        | `useOrders`        | the `Orders` page      |
| `profile-state.type.ts`        | `ProfileState`       | `useProfile`       | the `Profile` page     |
| `scan-phase.type.ts`           | `ScanPhase`          | `useScan` (state)  | the `Scan` page        |
| `scan-state.type.ts`           | `ScanState`          | `useScan`          | the `Scan` page        |

A shape that crosses the wire is a schema class in `schemas/` or a producer's class from
`#stackra/clients/<service>` (`OrderView`, `InboxMessageView`), never a type here. Component props
are `<name>.props.ts` beside the component, not here.
