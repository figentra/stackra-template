# assets

The mobile app's own static assets, at the member root like every package's and every module's
`assets/` (ADR 0234, 0177): folder name = kind.

| Folder                           | Holds                                                                                                   | Consumed by                                             |
| -------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `lang/<locale>/<namespace>.json` | `mobile` (shared), `pages` (one object per route), `documents`; complete in `en` and `ar`; ICU messages | `#stackra/i18n` (`I18n.mobile.*`, `I18n.pages.*`, …)    |
| `lang/{en-US,ar-SA}/`            | regional overlays: only the keys whose wording differs, falling back to `en`, `ar`                      | `#stackra/i18n` (`fallbacks`)                           |
| `public/logo.svg`                | the one logo source, hex fills (a rasteriser has no CSS)                                                | gen: app icon, adaptive icon, splash, notification icon |

The namespace folder layout (`<locale>/<namespace>.json`) is the one rule for apps, packages and
modules, so one loader and one gen rule serve them all. A key under a derived kind segment
(`routes`, `documents`, `enums`, `errors`) is the derived key of a declaration and is never authored
for anything else (ADR 0294 decision 20); every other key is authored. Strings of another module are
overrides and live in the one overrides tree, `src/overrides/<owner>/` mirroring the owner's path
(`src/overrides/commerce/orders/assets/lang/<locale>/orders.json` shortens one `orders::` string for
a phone), never here. `public/logo.svg` is the app's own mark: app icons live in the app, no package
ships them. `usage.camera` is the iOS usage string gen writes into the camera plugin. Code imports a
file here only as `#assets/<path>` (the `imports` alias), never by a relative path.
