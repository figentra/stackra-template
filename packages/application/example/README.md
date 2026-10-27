# @figentra/acme-example

An example package: rename it to the product's first shared package or delete it.

**Tier:** `tier:lib` (`packages/application/example`), in the programming model v3 shape (ADR 0294, 0295).

## Entries

`.` (`src/core/`, `src/config/`), `./contracts`, `./node`, `./react`, `./native` and `./testing`. An entry is
exported with its first file; `stackra gen` writes the barrels and the tool configs into `.stackra/`. Code
imports its own `src/` as `#src/...`; files under `assets/` are `#assets/...` and the `./assets/*` export.

## Tasks

`build`, `typecheck`, `lint` and `test` run `stackra <task>`, which runs gen and then the tool.
