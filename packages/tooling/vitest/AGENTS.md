# AGENTS — @stackra/vitest-config

- Owner: release-operations.
- A consuming member calls its role (`libraryPreset`, `servicePreset`, `appPreset`, `mobilePreset`,
  `tooling`) and adds no test options; change the preset and ship a changeset.
- Coverage thresholds live in `src/coverage.ts` here; a threshold only moves upward.
- Secrets: forbidden.

## PII

| Data | Where | Handling                                                    |
| ---- | ----- | ----------------------------------------------------------- |
| none | —     | Test presets; they configure the runner and handle no data. |
