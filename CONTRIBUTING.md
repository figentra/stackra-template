# Contributing

The working rules live in [`AGENTS.md`](AGENTS.md) (rules and skills come from
`stackra agents setup`); the project's guides are in `apps/docs` (`pnpm docs`) and the framework's
in the [Stackra docs](https://docs.stackra.figentra.com). The short version:

1. `mise install`, then `pnpm install` (dependencies, git hooks and the MCP config). Once per
   machine, `stackra agents setup` installs the Stackra skills, sub-agents and guard hooks for your
   assistant.
2. Branch from `main`; one change per branch, linked to its issue.
3. Versions come only from `pnpm-workspace.yaml` catalogs or `workspace:*`. Tests sit in
   `__tests__/` beside their subject. Run `pnpm gen` after changing a declaration; commit the
   member's `.stackra/app-manifest.json` (and a service's `openapi.json`) with the change, never the
   rest of `.stackra/`.
4. When a published package changes, add a changeset in the same change: `pnpm changeset`, pick the
   packages and the bump (`patch`, `minor`, `major`), and write the release note
   ([`.changeset/README.md`](.changeset/README.md)). Apps and services need none; they deploy by
   commit.
5. Use conventional commits (`.commitlintrc.yaml`, rules from `@stackra/commitlint-config`).
6. `pnpm verify` must be green (format, lint, typecheck, test, build, gen check, validate,
   boundaries, knip), and `pnpm spell` clean.
7. Open a pull request using the template and state its change risk (below). A reviewer other than
   the author approves; the code owners in `.github/CODEOWNERS` review the files they own.

## Change risk

Every pull request states one level, the highest that applies
([Stackra ADR 0120](https://docs.stackra.figentra.com/adr/0120-sdlc-spec-location-lanes-and-change-risk)):

| Level | The change touches                                                                                                                                       |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R0    | docs, comments or tests only                                                                                                                             |
| R1    | one member, internally, with no contract change                                                                                                          |
| R2    | a public contract, a new package or member, several members, a new dependency or a UI surface                                                            |
| R3    | auth, IAM, tenancy or row-level security, tenant-data migrations, money, personal data, secrets, webhooks or outbound HTTP, cryptography, CI permissions |

An R3 change needs a review from a code owner of the area it touches.

## Formatting and spelling

oxfmt (`.oxfmtrc.jsonc`) is the only formatter, the same in the editor, the pre-commit hook and CI.
It owns `ts` `tsx` `mts` `cts` `js` `jsx` `mjs` `cjs`, `json` `jsonc` `json5`, `yaml` `yml`, `toml`,
`md` `mdx`, `css` and `html`. Markdown prose wraps at 100 columns.

- oxfmt formats whole files only: VS Code "Format Selection" is not supported, so save formats the
  whole file (`.vscode/settings.json`). Even Better TOML stays for TOML schemas and validation, not
  formatting.
- `pnpm format` writes, `pnpm format:check` checks; lefthook checks staged files and CI checks the
  whole repository. `.oxfmtrc.jsonc` ignores generated and vendored paths only.
- A file type gets a second formatter only when oxfmt cannot format it (shell scripts would take
  shfmt), and is added to this section.
- Spelling is British English (`cspell.config.yaml`): `pnpm spell` checks the repository, lefthook
  checks staged files and CI checks everything. Add a real project word to the `words` list there,
  never to your own editor settings.

## Conduct

This project follows the
[Contributor Covenant, version 2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).
Report unacceptable behaviour privately to a member of the maintainers team (`@acme/platform-team`,
`.github/CODEOWNERS`); reports are handled confidentially.

Report security issues privately, as described in [`SECURITY.md`](SECURITY.md).
