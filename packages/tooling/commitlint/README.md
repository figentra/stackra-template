# @stackra/commitlint-config

The commitlint preset. A repo's `.commitlintrc.yaml` is:

```yaml
extends:
  - "@stackra/commitlint-config"
rules:
  refs-issue-key:
    - 2
    - always
    - PROJ
```

The preset extends `@commitlint/config-conventional` and sets the house type list, subject case,
`scope-case` off (member short names may carry digits) and the header and body lengths.

| Rule             | Default | Meaning                                                                                                             |
| ---------------- | ------- | ------------------------------------------------------------------------------------------------------------------- |
| `refs-issue-key` | off     | The value is the issue prefix. A `feat`, `fix`, `refactor` or `perf` commit then needs a `Refs: <PREFIX>-n` footer. |

The rule checks the footer's prefix and shape only; it does not look the issue up in your tracker.
