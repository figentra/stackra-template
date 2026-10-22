# Contributing

The working rules live in [`AGENTS.md`](AGENTS.md) (rules and skills come from `stackra agents setup`); the guides are in `apps/docs` (`pnpm docs`)
and the Stackra docs. The short version:

1. `mise install`, then `pnpm install` (git hooks and the MCP config). Once per machine: `stackra agents setup`
   installs the Stackra skills, sub-agents and guard hooks for your assistant.
2. Branch from `main`; one change per branch, linked to its issue.
3. Versions come only from `pnpm-workspace.yaml` catalogs or `workspace:*`. Tests sit in `__tests__/` beside their
   subject. Run `pnpm gen` after changing a declaration; commit the member's `.stackra/app-manifest.json` (and a
   service's `openapi.json`) with the change, never the rest of `.stackra/`.
4. Use conventional commits (`commitlint.config.mjs`).
5. `pnpm verify` must be green (format, lint, typecheck, test, build, gen check, validate, boundaries, knip).
6. Open a pull request using the template. A reviewer other than the author approves.

Report security issues privately, as described in [`SECURITY.md`](SECURITY.md).
