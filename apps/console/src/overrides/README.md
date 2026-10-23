# src/overrides

The one place this app changes files it does not own. `src/overrides/<owner>/` mirrors the owner's
own path: `<owner>` is a package name with its scope (`@acme/loyalty-kit`) or `<service>/<module>`
for a consumed service module. A file here shadows the file at the same path, with no keyword and no
suffix; gen picks it up, checks that the target still exists and has the same shape, and reports a
shadow whose target changed on an upgrade.

| Path under `@acme/loyalty-kit/src/`                       | Shadows                                  | How                                                 |
| --------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------- |
| `react/points-balance/points-balance.tsx`                 | the kit's `PointsBalance` renderer       | replaced: same name, same `PointsBalanceProps`      |
| `node/resources/loyalty-account/points-balance.widget.ts` | the kit's unplaced `PointsBalanceWidget` | `Widget.place`: the dashboard's main grid, order 40 |

A component shadow exports the same name with the same Props; a placement shadow keeps the base's
name, imports the base as `Base<Name>` and changes only slot, order, size and params, and a second
placement of one widget fails gen. Lang files merge key by key over the owner's file
(`<owner>/assets/lang/<locale>/<namespace>.json`); images and icons replace. Configuration is not an
override: a package's config is set in `src/config/`.
