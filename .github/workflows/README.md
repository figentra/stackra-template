# `.github/workflows/`

| Workflow      | Runs on                                                                        | Does                                                                                                                                                                                                                                                                                                            |
| ------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ci.yml`      | pull requests to `main`, merge-queue groups (`merge_group`), pushes to `main`  | **Quality Gate**: install, the pull request title and commit messages (commitlint), `pnpm verify` (`stackra verify`), `pnpm spell` and `pnpm secrets:scan`. While `@stackra/*` is unpublished (pre-release) it runs `node .github/scripts/preview-gate.mjs` instead. A superseded pull request run is cancelled |
| `release.yml` | pushes to `main`; `workflow_dispatch` with a `dry_run` input (publish dry run) | Changesets: opens or updates the "version packages" PR, publishes released packages to npm with provenance (trusted publishing, no token), then builds a CycloneDX SBOM when something was published. Skipped (green) until `pnpm-lock.yaml` is committed                                                       |

## Rules

- Least privilege (Stackra ADR 0019): `permissions` at the workflow is read-only or empty, and a job
  asks only for what it needs.
- No long-lived token is a repository secret where OIDC works (npm trusted publishing; your secret
  store's OIDC login).
- Third-party actions are pinned to a commit SHA, with the version in a comment; Renovate
  (`renovate.json5`) proposes the updates.
- Runner images are pinned (`ubuntu-24.04`), so an image upgrade is a reviewed change.
- The toolchain comes from `mise.toml`, so CI runs the same versions as a contributor.
- Turborepo remote cache (Stackra STA-1393): a job that runs turbo first logs in to Infisical by
  OIDC with the org variable `INFISICAL_TURBO_IDENTITY_ID` and exports `TURBO_API`, `TURBO_TOKEN`,
  `TURBO_TEAM` and `TURBO_REMOTE_CACHE_SIGNATURE_KEY` from `/ci/turbo`. Without the variable the
  step is skipped and turbo uses its local cache only.

## Branch rules

`.github/rulesets/main.json` is the ruleset for `main`: pull requests only, squash merges, linear
history, one approving review from a code owner after the last push, every review thread resolved,
and the `Quality Gate` check from GitHub Actions passing on an up-to-date branch. Import it under
**Settings → Rules → Rulesets → Import a ruleset**. The merge queue is off; `ci.yml` already answers
`merge_group`, so turning it on later is one `merge_queue` rule in that file.

## Run the gate locally

`node .github/scripts/preview-gate.mjs` runs the same checks as the pre-release Quality Gate (the
pull request title when `PR_TITLE` is set, commit messages against `origin/main`, format, spelling,
config files parse, secrets scan); name checks to run a subset, for example
`node .github/scripts/preview-gate.mjs format spelling`. It needs only Node and the gitleaks pinned
in `mise.toml`.

Runbooks: [CI](https://docs.stackra.figentra.com/runbooks/ci) and
[release](https://docs.stackra.figentra.com/runbooks/release).
