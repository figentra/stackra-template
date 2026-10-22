# `.github/workflows/`

| Workflow      | Runs on                                   | Does                                                                                                                                                                                                    |
| ------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ci.yml`      | pull requests to `main`, pushes to `main` | **Quality Gate**: install, commit messages (commitlint), `pnpm verify` (`stackra verify`), `pnpm secrets:scan`. `deploy-staging` is a placeholder: runway.yaml describes the deploy, a human applies it |
| `release.yml` | pushes to `main`                          | Changesets: opens or updates the "version packages" PR, publishes released packages to npm with provenance (trusted publishing, no token), uploads a CycloneDX SBOM                                     |

## Rules

- Least privilege (Stackra ADR 0019 D2): `permissions` at the
  workflow is read-only or empty, and a job asks only for what it needs.
- No long-lived token is a repository secret where OIDC works (npm trusted publishing; your secret store's OIDC login).
- Third-party actions are pinned to a commit SHA, with the version in a comment.
- The toolchain comes from `mise.toml`, so CI runs the same versions as a contributor.

Runbooks: Stackra docs `/runbooks/ci` and `/runbooks/release`.
