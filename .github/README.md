# `.github/`

GitHub configuration for the repository (Stackra ADR 0012: GitHub is the code host).

| Path                       | Holds                                                                                                      |
| -------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [`workflows/`](workflows)  | CI (the `Quality Gate`, which runs `pnpm verify`) and release (Changesets)                                 |
| `ISSUE_TEMPLATE/`          | bug and feature forms; security reports go to private advisories                                           |
| `pull_request_template.md` | the PR body: summary, change risk, verification checklist                                                  |
| `CODEOWNERS`               | the default owner; replace `@your-org/your-team`                                                           |
| `branch-protection.json`   | the `main` protection rules as a GitHub REST payload: `Quality Gate` required, one approval, no force push |

## Rules

- `Quality Gate` is the required check. A reviewer other than the author approves; merges are squash merges, never a
  push to `main` and never `--admin`.
- Changes here are CI and permission changes, change risk R3.
- `branch-protection.json` stays strict JSON: it is a REST payload.
