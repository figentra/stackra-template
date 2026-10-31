# AGENTS — @figentra/acme-service-example

An example service: rename it to the product's first service or delete it. Member at `services/example` (`tier:service`), in the programming model v3 shape.

## Rules that fail the build

- No Encore file or import, no `main.ts`, no tool config: gen writes them into `.stackra/`.
- Never import another service; use its generated client or its events.
- A business value (a price, a rate, a country rule) is seed data or a setting, never code.
- Versions are `catalog:<name>` or `workspace:*` only.

## PII

None yet. Revisit when it stores or receives user data.
