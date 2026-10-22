# Contributing

The working rules live in [`AGENTS.md`](AGENTS.md) (rules and skills come from `stackra agents setup`); the guides are in `apps/docs` (`pnpm docs`)
and the Stackra docs. The short version:

1. `mise install`, then `pnpm install` (git hooks and the MCP config). Once per machine: `stackra agents setup`
   installs the Stackra skills, sub-agents and guard hooks for your assistant.
2. Branch from `main`; one change per branch, linked to its issue.
3. Versions come only from `pnpm-workspace.yaml` catalogs or `workspace:*`. Tests sit in `__tests__/` beside their
   subject. Run `pnpm gen` after changing a declaration; commit the member's `.stackra/app-manifest.json` (and a
   service's `openapi.json`) with the change, never the rest of `.stackra/`.
4. Use conventional commits (`.commitlintrc.yaml`, rules from `@stackra/commitlint-config`).
5. `pnpm verify` must be green (format, lint, typecheck, test, build, gen check, validate, boundaries, knip).
6. Open a pull request using the template. A reviewer other than the author approves.

## Formatting

oxfmt (`.oxfmtrc.jsonc`) is the only formatter, the same in the editor, the pre-commit hook and CI. It owns `ts`
`tsx` `mts` `cts` `js` `jsx` `mjs` `cjs`, `json` `jsonc` `json5`, `yaml` `yml`, `toml`, `md` `mdx`, `css` `scss`
`less`, `html`, `graphql` and `vue`.

- oxfmt formats whole files only: VS Code "Format Selection" is not supported, so save formats the whole file
  (`.vscode/settings.json`). Even Better TOML stays for TOML schemas and validation, not formatting.
- `pnpm format` writes, `pnpm format:check` checks; lefthook checks staged files and CI checks the whole
  repository. `.oxfmtrc.jsonc` ignores generated and vendored paths only.
- A file type gets a second formatter only when oxfmt cannot format it (shell scripts would take shfmt, as in
  Stackra), and is added to this section.

Report security issues privately, as described in [`SECURITY.md`](SECURITY.md).
