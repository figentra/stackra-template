# @figentra/acme-example

An example package: its console page, mobile screen and landing block show how a product ships packages into
the OS shells. Rename it to the product's first package or delete it.

## What the OS shells load

| Export      | File              | Loaded by                      | What it does                                                        |
| ----------- | ----------------- | ------------------------------ | ------------------------------------------------------------------- |
| `./console` | `src/console.tsx` | the console shell (console@3)  | `register(shell)`: `shell.route(...)` adds the example's page       |
| `./native`  | `src/native.tsx`  | the mobile template (mobile@3) | `register(app)`: `app.screen(...)` adds the screen Home lists       |
| `./landing` | `src/landing.ts`  | the landing shell (landing@1)  | registers the `acme_example.hero` block that `assets/landing` draws |

Run all three locally from the repository root with `stackra dev --product --os <figentra/os checkout>
--device <simulator udid>`. The register functions and the hand-written block schema are shortcuts until gen
writes the package's entries and schemas (STA-339).

**Tier:** `tier:lib` (`packages/application/example`), in the programming model v3 shape (ADR 0294, 0295).

## Entries

`.` (`src/core/`, `src/config/`), `./contracts`, `./node`, `./react`, `./native` and `./testing`. An entry is
exported with its first file; `stackra gen` writes the barrels and the tool configs into `.stackra/`. Code
imports its own `src/` as `#src/...`; files under `assets/` are `#assets/...` and the `./assets/*` export.

## Tasks

`build`, `typecheck`, `lint` and `test` run `stackra <task>`, which runs gen and then the tool.
