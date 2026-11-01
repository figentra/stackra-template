# @figentra/acme-service-example

An example service: rename it to the product's first service or delete it.

A plain-TypeScript service member (`tier:service`) in the programming model v3 shape (ADR 0294, 0295). Feature
modules go in `src/modules/<key>/` (imported as `#modules/<key>/...`, the rest of `src/` as `#src/...`), files
under `assets/` are `#assets/...` and the `./assets/*` export. `stackra gen` writes the wiring, the server entry
and the Encore app into `.stackra/`. Nobody writes `main.ts`.
