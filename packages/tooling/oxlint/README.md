# @stackra/oxlint-config

oxlint presets. A workspace's `.oxlintrc.jsonc` is
`{ "extends": ["../../../node_modules/@stackra/oxlint-config/src/<preset>.jsonc"] }` — oxlint
resolves `extends` as a file path, not a package export, so every preset stays a plain file in this
package's `src/`.

| Preset             | Extends | Adds                                                                                      |
| ------------------ | ------- | ----------------------------------------------------------------------------------------- |
| `base.jsonc`       | —       | categories: `correctness` error, `suspicious` warn; `any`, unused code, cycles are errors |
| `node.jsonc`       | base    | node env                                                                                  |
| `boundaries.jsonc` | node    | the tier dependency rule; the repo root extends this one                                  |
| `decorators.jsonc` | node    | kind classes: `new-cap` relaxed for base and decorator factories, facet-only classes      |
| `react.jsonc`      | base    | react + jsx-a11y plugins, hooks rules                                                     |
