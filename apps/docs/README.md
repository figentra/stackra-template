# @acme/docs

The project's documentation site, built with Mintlify. Everything Mintlify reads lives in `src/`:
`docs.json`, the MDX pages, and the API reference. Three things are written by hand; the rest is
generated from the services' committed manifests (the docs app reads only committed contracts and
generated output, never a service's source).

| Path                          | Written by | Holds                                                                                   |
| ----------------------------- | ---------- | --------------------------------------------------------------------------------------- |
| `src/docs.json`               | hand       | site settings, navigation tabs, the OpenAPI source of the API tab                       |
| `src/index.mdx`, `quickstart` | hand       | the landing and the first ten minutes                                                   |
| `src/guides/`                 | hand       | how the project is built (the programming model, adding a field, testing)               |
| `src/adr/`                    | hand       | the project's own decisions in the house ADR format, plus the index                     |
| `src/api-reference/`          | gen        | `openapi.json` merged from every consumed service, `events.mdx`, `introduction`         |
| `src/llms.txt`                | gen        | the agent-readable index: every page, every action key, every event                     |
| `src/assets/`                 | hand       | favicon and logos; Mintlify's content root is `src/`, so this is the member's `assets/` |

`stackra gen` runs before `build` in the turbo graph and reads the committed `stackra.manifest.json`
at the root of every service member in the workspace (there is no `stackra` field in `package.json`
and no `consumes` list). The docs app is the one app with no `stackra.config.ts` and no root module:
it is a Mintlify site with no TypeScript runtime (Stackra ADR 0294 rule R12). Pages and data gen
writes for the docs are committed, and `stackra gen --check` fails when they are stale.

| Command      | Does                                       |
| ------------ | ------------------------------------------ |
| `pnpm dev`   | local preview on the port in `runway.yaml` |
| `pnpm build` | `mint validate`, strict, fails on warnings |
| `pnpm lint`  | `mint broken-links`                        |
| `pnpm a11y`  | Mintlify's accessibility check             |

`runway.yaml` holds the one dev port; `stackra dev` records every member's port in
`.stackra/dev/ports.json`, so no page names a port. Hosting is Mintlify's, connected to the
repository with the monorepo path `apps/docs/src` (ADR 0002). The hosted site serves `/llms.txt` and
`/llms-full.txt`; the generated `src/llms.txt` is the version agents read from the repository.
