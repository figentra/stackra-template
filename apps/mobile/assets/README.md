# assets

The mobile app's own static assets, at the member root like every package's and every module's
`assets/` (ADR 0234, 0177): folder name = kind.

| Folder                           | Holds                                                                                                  | Consumed by                                             |
| -------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| `lang/<locale>/mobile.json`      | the `mobile::` namespace, one file per locale (`en/`, `ar/`); same keys, ICU messages                  | `#stackra/i18n` (the typed `I18n.mobile.*` tree)        |
| `overrides/orders/<locale>.json` | this app's wording of `orders::actions.order.cancel.confirm`, merged key by key over the module's file | `#stackra/i18n` (`overrides`)                           |
| `public/logo.svg`                | the one logo source, hex fills (a rasteriser has no CSS)                                               | gen: app icon, adaptive icon, splash, notification icon |

The namespace folder layout (`<locale>/<namespace>.json`) is the one rule for apps, packages and
modules, so one loader and one gen rule serve them all. A key under a derived kind segment
(`routes`, `documents`, `enums`, `errors`) is the derived key of a declaration and is never authored
for anything else (ADR 0294 decision 20); every other key is authored. Strings of another module are
overrides and live in `overrides/<namespace>/<locale>.json` (`overrides/orders/` shortens one
`orders::` string for a phone), never in `lang/`. `usage.camera` is the iOS usage string gen writes
into the camera plugin. Code imports a file here only as `#assets/<path>` (the `imports` alias),
never by a relative path.
