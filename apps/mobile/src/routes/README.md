# src/routes

One term for web, console and mobile: a mobile screen is a route with native presentation options
(ADR 0294 decisions 14 and 16). Each route is a folder `routes/<name>/` holding `<name>.route.ts`
(`extends Route({...})`, or `<name>.layout.ts` with `extends Layout`), the page `<name>.tsx` bound
by name, at most one hook `use-<name>.ts`, and `__tests__/`. The class is static options plus
behaviour (`loader`, `submit`, `meta`); the page is a function typed `RouteComponent<typeof X>` that
imports its route as a type only. Gen collects the classes into `#stackra/navigation` (the React
Navigation tree: the signed-in root native stack, the native tab bar with one stack per tab, the
signed-out stack), `#stackra/routes` (typed keys, params and the linking map) and reports a path
declared twice. A hand-written navigator or route config is banned.

| Folder                      | Class                          | Where                             | Shows                                                          |
| --------------------------- | ------------------------------ | --------------------------------- | -------------------------------------------------------------- |
| `tabs/`                     | `TabsLayout`                   | the signed-in shell (`loader`)    | redirects to sign-in without a session; selects the tenant     |
| `home/`                     | `HomeRoute`                    | tab root, `/`                     | widgets, quick actions, announcements and inbox links          |
| `orders/`                   | `OrdersRoute`                  | tab root, `/orders`               | cursor list refreshed by the realtime `OrderPaid` event        |
| `settings/`                 | `SettingsRoute`                | tab root, `/settings`             | language, appearance, notifications, privacy, profile          |
| `order-detail/`             | `OrderDetailRoute`             | screen, `/orders/:orderId`        | `loader` reads `GetOrder`; permission derived from it          |
| `create-order/`             | `CreateOrderRoute`             | sheet, `/orders/new`              | the derived form; queued offline; toast on success             |
| `scan/`                     | `ScanRoute`                    | full screen, `/scan`              | the `scanner` capability; behind `Flags.orders.quick_order`    |
| `announcements/`            | `AnnouncementsRoute`           | screen, `/announcements`          | `document: AnnouncementsDocument` through the route adapter    |
| `inbox/`                    | `InboxRoute`                   | screen, `/inbox`                  | the notifications service's inbox with the plural unread count |
| `notification-preferences/` | `NotificationPreferencesRoute` | screen, `/settings/notifications` | the generated user-scope settings form                         |
| `profile/`                  | `ProfileRoute`                 | screen, `/profile`                | the user, tenant memberships and the switcher                  |
| `sign-in/`                  | `SignInRoute`                  | signed-out stack (`auth: false`)  | one button that opens ZITADEL's hosted sign-in                 |

| Option         | Meaning                                                                                                  |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| `path`         | absolute, with a leading slash; `/` is the landing route of the scheme and of universal links            |
| `layout`       | the layout class the route mounts under; with `tab` it makes the route a tab root                        |
| `tab`          | `{ order, icon }`: the tab bar entry; its label is the route's title, its test id `tab-<route key>`      |
| `presentation` | `Presentation.Sheet` (iOS 26 sheet with detents, modal on Android), `FullScreen`; a pushed page if unset |
| `chrome`       | this screen's chrome over `chrome.config.ts`: `{ header: HeaderStyle.Large }` on tab roots, `Hidden`     |
| `params`       | a schema class from `schemas/`; gen types the page's `params` and validates deep links before mount      |
| `auth`         | every route needs a session by default; `false` mounts it only in the signed-out tree                    |
| `permission`   | only on a route with no `loader` (its page's hook calls the client); otherwise derived from the loader   |
| `document`     | a document class the route adapter resolves to the tenant's published version or the class itself        |
| `flag`         | a `Flags.*` constant; the route and its entry points hide while the flag is off for the tenant           |
| `capability`   | `{ port: Capability.Required }` fails gen for a target without it; `Optional` degrades                   |
| `cache`        | `{ ttl }`: how long the persisted query cache serves the route offline                                   |

The title is never written: it is the derived key `mobile::routes.<route key>.title`. Route keys are
the snake_case of the folder (`order_detail`); `#stackra/routes` exports `Routes` under those keys
and the `RouteKey` enum. Links point down (layout ← route → page): pages, menus, layouts and data
navigate with `navigate.to(Routes.order_detail, params)` and never import a route class; a
document's navigate verb holds a `RouteKey` resolved with `Routes[key]`.

Tests sit in each folder's `__tests__/`: `<name>.test.tsx` with `renderRoute(Routes.<key>)` from
`@stackra/testing/native` (the route's params, loader and document against faked clients, under the
testing providers), `<name>.layout.test.ts` with `runLoader` from `@stackra/navigation/testing`, and
the Maestro journeys `*.flow.yaml` (`stackra.config.ts` `maestro.flows`), run on iOS and Android in
every locale.
