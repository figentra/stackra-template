# @acme/docs

<!--
Stackra file contract:
Purpose: the README of @acme/docs: the docs source layout, what gen writes, the commands and how the site deploys.
Boundary: this member only; the pages are under src/docs, the site configuration in src/config/docs.config.ts.
Runtime: none
Governing contract: Stackra ADR 0002 (2026-10-27 amendment); Stackra ADR 0299 (docs runway); stackra-177.
-->

The project's documentation site, built with Mintlify. You write the source; `stackra gen` assembles
the site Mintlify reads into `.stackra/site/` (gitignored, never edited). The docs app reads only
committed contracts and generated output, never a service's source.

| Path                                   | Written by | Holds                                                                                             |
| -------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------- |
| `src/config/docs.config.ts`            | hand       | the site: name, colours, logo, favicon, tabs and navigation, footer, `apiReference`, `raw` keys   |
| `src/docs/index.mdx`, `quickstart.mdx` | hand       | the landing and the first ten minutes                                                             |
| `src/docs/guides/`                     | hand       | how the project is built (the programming model, adding a field, testing)                         |
| `src/docs/adr/`                        | hand       | the project's own decisions in the house ADR format, plus the index                               |
| `src/docs/api-reference/`              | hand       | `introduction` (areas, auth, idempotency, errors, versions) and `events` (kept from the manifest) |
| `src/assets/`                          | hand       | favicon and logos, referenced as `/assets/<path>`                                                 |
| `.stackra/site/`                       | gen        | `docs.json`, the pages, `api-reference/commerce/openapi.json`, `llms.txt`                         |

- **Pages.** `src/docs/guides/x.mdx` is served at `/guides/x`. Add a page: write the `.mdx` under
  `src/docs/`, then list it in a group of `src/config/docs.config.ts`. Gen refuses a page no group
  lists, a listed page that does not exist, an asset no page references, and a `docs.json` or
  `README.md` under `src/`.
- **Guides** explain how the project is built, one page per topic; a guide never restates the API
  (that is generated) or records a decision (that is an ADR).
- **ADRs** use the house format (Context, Decision, Consequences, Enforcement, Supersedes and
  sources). `index.mdx` is the table; each record is `NNNN-short-title.mdx`, numbered from the
  highest existing plus one, and is served at `/adr/<file>`. The `{ folder: "adr" }` group lists
  every record, so a new one needs only its index row. An accepted ADR is never rewritten: a later
  one supersedes it in the same commit, and both pages point at each other. Stackra's own ADRs are
  cited by number with the `stackra/` prefix so the two sequences never mix.
- **API reference.** `apiReference: ["commerce"]` makes gen write
  `api-reference/commerce/openapi.json` from `services/commerce/stackra.manifest.json` (public and
  app areas) and an "API reference" tab after the authored tabs; Mintlify renders one page per
  operation with try-it and the `x-stackra-*` extensions (permission, risk, area, idempotency) as
  badges. Gen also writes `llms.txt`, the agent-readable index of every page.

| Command      | Does                                                                     |
| ------------ | ------------------------------------------------------------------------ |
| `pnpm dev`   | gen in watch mode, then `mint dev` in `.stackra/site` on the runway port |
| `pnpm build` | gen, then `mint validate`, strict, fails on warnings                     |
| `pnpm lint`  | gen, then `mint broken-links` and `mint a11y`                            |

`runway.yaml` holds the one dev port and the published host; `stackra dev` records every member's
port in `.stackra/dev/ports.json`, so no page names a port. The site is hosted by Mintlify and
deployed from CI by its runway (Stackra ADR 0299): `build` and `lint` run on each pull request
(`pnpm verify`) and must pass before merge; the root runway's `targets.mintlify` pushes the
generated `.stackra/site` to its deploy branch, which the Mintlify GitHub app builds, then a smoke
test checks every page of the navigation on the published host. The Mintlify admin key
(`MINTLIFY_ADMIN_KEY`) sits in the `ci` path of the secret store and only the deploy job reads it.
The hosted site serves `/llms.txt` and `/llms-full.txt`.
