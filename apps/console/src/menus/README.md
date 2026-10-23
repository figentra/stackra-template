# src/menus

Menu classes of the desktop target (ADR 0294 decision 14): `extends Menu({ kind })` with an `items`
builder that uses only the closed item verbs (route, link, action, shortcut, group, separator,
navigation), never CSS. Items name Shortcut classes, generated client classes and route keys, so a
removed one is a type error; labels are `menus::<menu>.*` keys, translated in the Electron main with
the locale the renderer reports. Desktop only by their kind: a PWA has no OS menu bar. Electron's
own role items (the macOS app menu, Edit, Window, Quit) are `desktop.config.ts`
`menus.standardRoles`, placed by the shell around these items.

| File           | Class      | Kind            | Holds                                          |
| -------------- | ---------- | --------------- | ---------------------------------------------- |
| `app.menu.ts`  | `AppMenu`  | `MenuKind.App`  | the menu bar: file, view, go and help groups   |
| `tray.menu.ts` | `TrayMenu` | `MenuKind.Tray` | the tray icon's menu: open the pending changes |

Gen writes both into the main process's wiring (`.stackra/desktop/wiring.ts`).
