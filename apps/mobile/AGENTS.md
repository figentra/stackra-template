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
  generated clients, imported by class name from `#stackra/clients/<service>`. A class states its
  kind in its base class, and its group folder is fixed (ADR 0294 decision 14); a page is the class
  component `<name>.tsx` beside its route class.
- Components, pages and renderers are `extends Component<Props>` with `Component` from `#stackra/ui`
  and every other component from `@stackra/ui/native` (never `react`); Props in `<name>.props.ts`, a
  hook's result type in `src/types/<name>.type.ts`, one exported declaration per file. No error
  boundary here: `@stackra/navigation` owns it.
- Config: the app's own class is `Config({ schema, env })`; a package override is `X extends BaseX`
  with `override` defaults only. Icons are `IconName` strings.
- No provider components: each package's context mounts from its config override in `src/config/`.
- Another member's strings or assets are changed only in `src/overrides/<owner>/`, mirroring the
  owner's path; lang files are `assets/lang/<locale>/<namespace>.json` with `en-US`/`ar-SA` overlays
  holding only differing keys.
- `.stackra/` and `stackra.manifest.json` are generated; change `stackra.config.ts`, `src/` or
  `assets/` and rerun `stackra gen`, never edit them.
- Secrets: forbidden; a native client holds none, and only `EXPO_PUBLIC_` names reach the binary.

## PII

| Data        | Where | Handling                                                                                                                        |
| ----------- | ----- | ------------------------------------------------------------------------------------------------------------------------------- |
| none stored | —     | Renders what the services return; it keeps only UI preferences (the remembered tenant per user) and queued mutations on device. |
