/**
 * Stackra file contract:
 * Purpose: conventional-commit enforcement for the lefthook commit-msg hook and CI.
 * Boundary: commit message rules only. Scope is the member's short name (commerce, notifications,
 *           console, web, mobile, docs, loyalty-kit, access-log, brand, typescript-config, …) or adr,
 *           deps, release; a commit touching the repo root uses `repo`. To require an issue key in a
 *           footer, set ISSUE_KEY below to your tracker's pattern (README, "Make it yours").
 * Runtime: node
 * Governing contract: conventional commits
 */
/** Issue-key footer pattern, for example /^Refs:\s*ABC-\d+\b/m; null turns the rule off. */
const ISSUE_KEY = null;
const KEYED = ["feat", "fix", "refactor", "perf"];

export default {
  extends: ["@commitlint/config-conventional"],
  plugins: [
    {
      rules: {
        "refs-issue-key": ({ type, raw }) => [
          !ISSUE_KEY || !KEYED.includes(type) || ISSUE_KEY.test(raw ?? ""),
          `${KEYED.join("/")} commits need an issue-key footer matching ${ISSUE_KEY}`,
        ],
      },
    },
  ],
  rules: {
    "refs-issue-key": [2, "always"],
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "docs", "refactor", "perf", "test", "build", "ci", "chore", "revert"],
    ],
    // Member short names are the scope vocabulary and may carry digits (i18n), which kebab-case rejects.
    "scope-case": [0],
    "subject-case": [2, "never", ["sentence-case", "start-case", "pascal-case", "upper-case"]],
    "header-max-length": [2, "always", 100],
    "body-max-line-length": [1, "always", 120],
  },
};
