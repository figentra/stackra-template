# src/routes

One term for web, console and mobile: a mobile screen is a `@Route` class with native presentation
options. Options are the static declaration gen reads from the AST; the class body is behaviour
(`guard`, or a `loader` for composite logic, never beside `prefetch`). The component is always an
option, never a body member, and lives under `components/pages/<name>/`. Gen collects the classes
into `#stackra/navigation` (the React Navigation 7 tree: the signed-in root native stack, the native
tabs with one stack per tab, the signed-out stack), `#stackra/routes` (typed keys, params and the
linking map) and reports a path declared twice. A hand-written navigator or route config is banned.

| File                                | Class                          | Where                                      | Shows                                                          |
| ----------------------------------- | ------------------------------ | ------------------------------------------ | -------------------------------------------------------------- |
| `tabs.layout.ts`                    | `TabsLayout`                   | the signed-in shell (native tabs, `guard`) | three tabs; redirects to `SignInRoute` without a session       |
| `home.route.ts`                     | `HomeRoute`                    | tab root, `/` with `index: true`           | widgets, quick actions, announcements and inbox links          |
| `orders.route.ts`                   | `OrdersRoute`                  | tab root, `/orders`                        | cursor list refreshed by the realtime `OrderPaid` event        |
| `settings.route.ts`                 | `SettingsRoute`                | tab root, `/settings`                      | language, appearance, notifications, privacy, profile          |
| `order-detail.route.ts`             | `OrderDetailRoute`             | card, `/orders/:orderId`                   | `prefetch: [GetOrder]`; permission derived from it             |
| `create-order.route.ts`             | `CreateOrderRoute`             | form sheet, `/orders/new`                  | the derived form; queued offline; toast on success             |
| `scan.route.ts`                     | `ScanRoute`                    | full-screen modal, `/scan`                 | the `scanner` capability; behind `Flags.orders.quick_order`    |
| `announcements.route.ts`            | `AnnouncementsRoute`           | card, `/announcements`                     | `document: AnnouncementsDocument` through the route adapter    |
| `inbox.route.ts`                    | `InboxRoute`                   | card, `/inbox`                             | the notifications service's inbox with the plural unread count |
| `notification-preferences.route.ts` | `NotificationPreferencesRoute` | card, `/settings/notifications`            | the generated user-scope settings form                         |
| `profile.route.ts`                  | `ProfileRoute`                 | card, `/profile`                           | the user, tenant memberships and the switcher                  |
| `sign-in.route.ts`                  | `SignInRoute`                  | signed-out stack                           | one button that opens ZITADEL's hosted sign-in                 |

| Option         | Meaning                                                                                                  |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| `path`         | absolute, with a leading slash; an index route is `index: true` with `path: "/"`                         |
| `layout`       | the layout class the route mounts under; a `NativeTabs` layout makes it a tab root (with `tab`)          |
| `presentation` | `Presentation.Card` (push), `FormSheet` (iOS 26 sheet with detents, modal on Android), `FullScreenModal` |
| `params`       | a schema class from `schemas/`; gen types the page's `params` prop and validates deep links before mount |
| `auth`         | `true` mounts only in the signed-in tree; `false` only in the signed-out tree                            |
| `prefetch`     | queries warmed from the params before mount; the route's permission is derived from them                 |
| `document`     | a `@Document` class the route adapter resolves to the tenant's published version or the class itself     |
| `permission`   | only on a route that neither prefetches nor submits (its page's hook calls the client)                   |
| `flag`         | a `Flags.*` constant; the route and its entry points hide while the flag is off for the tenant           |
| `capability`   | `{ port: Capability.Required }` fails gen for a target without it; `Optional` degrades                   |
| `header`       | `title` (typed i18n key)                                                                                 |
| `cache`        | `{ ttl }`: how long the persisted query cache serves the route offline                                   |

Route keys are the snake_case of the class name minus `Route` (`order_detail`); `#stackra/routes`
exports `Routes` under those keys and the `RouteKey` union. Links point down (app shell ← layout ←
route → page): pages, menus, layouts and data navigate with
`navigate.to(Routes.order_detail, params)` and never import a route class; a document's navigate
verb holds a `RouteKey` resolved with `Routes[key]`. Tabs are the routes that declare
`tab: { order, icon, label }`; the layout lists none.

Tests: `__tests__/<name>.layout.test.ts` for guards (`runGuard` from `@stackra/navigation/testing`);
`__tests__/*.flow.yaml` are the Maestro journeys, run on iOS and Android in every locale
(`stackra.config.ts` `e2e.flows`). Page rendering is tested beside the page, under
`components/pages/<name>/__tests__/`.
