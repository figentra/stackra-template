# AGENTS — @figentra/acme-example

An example package: rename it to the product's first shared package or delete it. Member at `packages/application/example` (`tier:lib`), in the programming model v3 shape
(ADR 0294, 0295, 0305).

## Where code goes

| You are writing…                    | It goes in…                                          |
| ----------------------------------- | ---------------------------------------------------- |
| A port, a public enum or type       | `src/contracts/{ports,enums,types}/`                 |
| Isomorphic code                     | `src/core/<group>/`                                  |
| Actions, queries, models, listeners | `src/node/<group>/`                                  |
| Fakes and matchers for consumers    | `src/testing/{fakes,matchers}/`                      |
| A test                              | `__tests__/<name>.<kind>.test.ts` beside its subject |

## Rules that fail the build

- Never write `main.ts`, an entry barrel or a tool config; gen writes them.
- A package never imports an app, a service, `encore.dev`/`~encore/*`, or another package's `src/`.
- Versions are `catalog:<name>` or `workspace:*` only.

## PII

None yet.
