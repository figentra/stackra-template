<!--
Stackra file contract:
Purpose: the agent notes of @acme/mobile: its owner, local rules and the personal data it holds.
Boundary: this member only; the project rules are in the root AGENTS.md.
Runtime: node
Governing contract: root AGENTS.md, ADR 0294, ADR 0295
-->

# AGENTS — @acme/mobile

- Owner: `@acme/platform-team` (`.github/CODEOWNERS`). This member is the iOS and Android app
  (Expo).
- Routes, components, blocks, menus and config only; data comes from the services through the
  generated clients (`#stackra/clients`). A class states its kind in its base class, and its group
  folder is fixed (ADR 0294 decision 14); a page is the `<name>.tsx` beside its route class.
- No provider components: each package's context mounts from its config override in `src/config/`.
- `.stackra/` and `stackra.manifest.json` are generated; change `stackra.config.ts`, `src/` or
  `assets/` and rerun `stackra gen`, never edit them.
- Secrets: forbidden; a native client holds none, and only `EXPO_PUBLIC_` names reach the binary.

## PII

| Data        | Where | Handling                                                                                                                        |
| ----------- | ----- | ------------------------------------------------------------------------------------------------------------------------------- |
| none stored | —     | Renders what the services return; it keeps only UI preferences (the remembered tenant per user) and queued mutations on device. |
