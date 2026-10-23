# api-reference (generated, except `introduction.mdx`)

`stackra gen` writes this folder from the committed `stackra.manifest.json` and `openapi.json` at
the root of every service member in the workspace; the docs app reads only contracts and generated
output.

| File               | Written by | Holds                                                                                                                                     |
| ------------------ | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `introduction.mdx` | hand       | areas, authentication, idempotency, the error envelope, versions, rate limits                                                             |
| `openapi.json`     | gen        | one OpenAPI 3.1 document merged from every consumed service's `openapi.json`, public and app areas only (platform endpoints are excluded) |
| `events.mdx`       | gen        | every public integration event with its version, producer and payload schema                                                              |

`docs.json` points the Endpoints group at `openapi.json`; Mintlify renders one page per operation
with try-it. The `x-stackra-*` extensions (permission, risk, area, idempotency) are shown as badges
by the Mintlify OpenAPI renderer's extension support. Nothing here is edited by hand;
`stackra gen --check` fails CI when it is stale.
