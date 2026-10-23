# src/routes

One term for web, console and mobile (ADR 0294 decisions 14 and 16). Each route is a folder
`routes/<name>/` holding `<name>.route.ts` (`extends Route({...})`, or `<name>.layout.ts` with
`extends Layout`), the page `<name>.tsx` bound by name, at most one hook `use-<name>.ts`, and
`__tests__/`. The class is static options plus behaviour (`loader`, `submit`, `meta`); the page is a
class component typed `extends Component<RouteProps<typeof X>>` that imports its route as a type
only. A route with a `document` or a redirect has no page. Gen collects the classes, together with
the panel routes it derives from the consumed resources, documents and settings pages, into
`.stackra/routes.tsx` (React Router 7) and `#stackra/routes` (typed keys and params), and reports a
path declared twice. A hand-written router or route config is banned.

| Folder         | Class             | Where                                   | Shows                                                                           |
| -------------- | ----------------- | --------------------------------------- | ------------------------------------------------------------------------------- |
| `shell/`       | `ShellLayout`     | the signed-in frame (`loader`)          | sidebar from the generated navigation, top bar, offline banner, outlet          |
| `public/`      | `PublicLayout`    | the frame without a session             | a centred page with the theme's mark and no chrome                              |
| `dashboard/`   | `DashboardRoute`  | `/`                                     | the KPI band and every widget placed in the dashboard's main grid               |
| `quick-order/` | `QuickOrderRoute` | `/quick-order`                          | the derived order form with loyalty points; behind `Flags.orders.quick_order`   |
| `settings/`    | `SettingsRoute`   | `/settings`                             | device, privacy and tenant tabs (`SettingsTab`), the pending changes            |
| `welcome/`     | `WelcomeRoute`    | `/welcome`                              | `document: WelcomeDocument` through the route adapter                           |
| `share/`       | `ShareRoute`      | `/share`                                | the PWA share target: the shared text and images, then attach-images            |
| `open-file/`   | `OpenFileRoute`   | `/open-file`                            | the PWA file handler: the opened images, then attach-images                     |
| `mobile-link/` | `MobileLinkRoute` | `/m/*`                                  | the mobile app's universal links without the app: its console page, or a notice |
| `open/`        | `OpenRoute`       | `/open`                                 | no page: turns a protocol or deep link into the in-app path it names            |
| `sign-in/`     | `SignInRoute`     | `/login` (`auth: false`)                | the hand-off to the hosted login through the BFF                                |
| `offline/`     | `OfflineRoute`    | `/offline` (`auth: false`, prerendered) | what the service worker serves when even the cached shell is missing            |
| `not-found/`   | `NotFoundRoute`   | `*` inside the shell (status 404)       | the catch-all with a way home                                                   |

| Option      | Meaning                                                                                           |
| ----------- | ------------------------------------------------------------------------------------------------- |
| `path`      | absolute, with a leading slash; the locale prefix (`/ar-sa/…`) is added by gen, never written     |
| `layout`    | the layout class the route mounts under                                                           |
| `title`     | the page title as an `I18n` key; for a page of this app it is `pages::<route key>.title`          |
| `tab`       | a tab item (ADR 0295 decision 12): `{ order, icon }`, `icon` an `IconName`, labelled by the title |
| `auth`      | every route needs a session by default; `false` mounts it under `PublicLayout` without one        |
| `prerender` | gen renders the page per locale at build time (the offline page)                                  |
| `document`  | a document class the route adapter resolves to the tenant's published version or the class itself |
| `flag`      | a `Flags.*` constant; the route and its entry points hide while the flag is off for the tenant    |
| `status`    | the HTTP status the server and the prerender answer with                                          |
| `targets`   | the targets a layout or route exists on (`Target.Web`, `Pwa`, `Desktop`)                          |

Route keys are the snake_case of the folder (`quick_order`); `#stackra/routes` exports `Routes`
under those keys. Links point down (layout ← route → page): pages, menus, shortcuts and documents
navigate with `Routes.<key>` and never import a route class. Tests sit in each folder's
`__tests__/`: `<name>.route.test.ts(x)` with `renderRoute` or `runRouteLoader`, `<name>.test.tsx`
for the page, `<name>.layout.test.tsx` for a layout, and the Playwright journeys `*.e2e.test.ts`
(with axe) after `stackra build`.
