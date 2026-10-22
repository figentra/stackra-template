# assets

The mobile app's own static assets, at the member root like every package's and every module's
`assets/` (ADR 0234, 0177; coordinator decision 3): folder name = kind.

| Folder                      | Holds                                                                                 | Consumed by                                             |
| --------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `lang/<locale>/mobile.json` | the `mobile::` namespace, one file per locale (`en/`, `ar/`); same keys, ICU messages | `#stackra/i18n` (the typed `I18n.mobile.*` tree)        |
| `public/logo.svg`           | the one logo source                                                                   | gen: app icon, adaptive icon, splash, notification icon |

The namespace folder layout (`<locale>/<namespace>.json`) is the one rule for apps, packages and
modules, so one loader and one gen rule serve them all. Strings of another module are overrides and
live in `src/overrides/<module>/lang/`, never here. `permissions.camera` is the iOS usage string gen
writes into the camera plugin. Code imports a file here only as `#assets/<path>` (the `imports`
alias), never by a relative path.
