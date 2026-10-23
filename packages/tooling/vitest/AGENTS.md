# AGENTS — @stackra/vitest-config

- Owner: release-operations.
- `stackra gen` writes each member's `.stackra/vitest.config.ts` calling its role (`libraryPreset`,
  `servicePreset`, `appPreset`, `mobilePreset`); only the tooling packages author theirs
  (`toolingPreset`). A member adds no test options: change the preset and ship a changeset.
- Coverage thresholds live in `src/coverage.ts` here; a threshold only moves upward.
- Secrets: forbidden.

## PII

| Data | Where | Handling                                                    |
| ---- | ----- | ----------------------------------------------------------- |
| none | —     | Test presets; they configure the runner and handle no data. |
