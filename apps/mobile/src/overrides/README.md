# src/overrides

The one place this app changes files it does not own. `src/overrides/<owner>/` mirrors the owner's
own path: `<owner>` is a package name with its scope (`@acme/loyalty-kit`) or `<service>/<module>`
for a consumed service module. A file here shadows the file at the same path, with no keyword and no
suffix; gen picks it up, checks that the target still exists and has the same shape, and reports a
shadow whose target changed on an upgrade.

| Path                                                            | Shadows                                                             | How           |
| --------------------------------------------------------------- | ------------------------------------------------------------------- | ------------- |
| `commerce/orders/assets/lang/<locale>/orders.json` (`en`, `ar`) | the commerce orders module's `orders::actions.order.cancel.confirm` | merged by key |

Lang files merge key by key over the owner's file and must name only keys the owner defines; images
and icons replace; a component shadow exports the same name with the same Props. Configuration is
not an override: a package's config is set in `src/config/`.
