# Security policy

## Reporting a vulnerability

Do not open a public issue, pull request or discussion. Report privately through GitHub's private
vulnerability reporting: the **Report a vulnerability** button on the repository's **Security** tab
(the issue form's "Security report" link opens the same page). Only the maintainers can read the
report.

Include the affected member (for example `services/commerce`), the version or commit, the steps to
reproduce, and the impact you see. Never put a secret value in a report; name the secret instead.

## What to expect

- Acknowledgement within three business days.
- An assessment and a fix or mitigation plan once the report is confirmed.
- A GitHub security advisory when the fix ships, with credit to you if you want it.

## Supported versions

| Component                                | Supported                                                                     |
| ---------------------------------------- | ----------------------------------------------------------------------------- |
| Apps and services (`apps/`, `services/`) | the revision deployed from `main`; a fix ships as a new deploy                |
| Published packages (`packages/`)         | the latest minor release of the current major; older releases are not patched |
| Tooling presets (`packages/tooling/`)    | the revision on `main` (they are not published)                               |

## Scope

The apps, services and packages in this repository, its CI workflows and its configuration. Issues
in a third-party dependency go to that project; tell us too if this repository is affected.

## For maintainers

Private vulnerability reporting is a repository setting: turn it on under **Settings → Code security
→ Private vulnerability reporting** before the first release.
