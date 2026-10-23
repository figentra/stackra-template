<!--
Stackra file contract:
Purpose: the agent notes of @acme/console: its owner, local rules and the personal data it holds.
Boundary: this member only; the project rules are in the root AGENTS.md.
Runtime: node
Governing contract: root AGENTS.md
-->

# AGENTS — @acme/console

- Owner: `@acme/platform-team` (`.github/CODEOWNERS`). This member is the tenant console (web, PWA,
  desktop).
- UI and routes only; data comes from the services through the generated client classes
  (`#stackra/clients/<service>`, imported by name), and the session, tenant, query and realtime
  contexts are the packages', mounted from their config classes. The console writes no root module
  (it would say nothing gen cannot derive) and no error boundary (`@stackra/navigation` owns it).
- Components, pages, layouts and block renderers are class components (`Component` from
  `#stackra/ui`, every other component from `@stackra/ui/react`), compiled to function components by
  gen; never `Component` from `react`. One exported declaration per file: Props in
  `<name>.props.ts`, hook results in `src/types/`. Icons are `IconName` strings.
- Code the console does not own is shadowed only under `src/overrides/<owner>/` at the owner's path;
  a config override stays in `src/config/` as `extends BaseX` (telemetry included: it overrides
  `@stackra/logger`'s config, and `EnvConfig` is the only config class the console defines).
- A side effect in a component (an object URL, a subscription) starts in `mount()` and ends in
  `unmount()`, never in a field initializer; tests throw a refusal or `TransportError`, never
  `new Error`.
- HeroUI Pro components (`AppLayout`, `Navbar`, `Sidebar`, `Command`, `Sheet`, `EmptyState`, `KPI`)
  come directly from `@heroui-pro/react` (Stackra ADR 0197 as amended (stackra#127)); every other
  primitive is `@stackra/ui`. Installing needs a HeroUI Pro licence: `HEROUI_PERSONAL_TOKEN` in
  Infisical, handed to the postinstall as `HEROUI_AUTH_TOKEN` by `pnpm install:pro` (local) and the
  OIDC step of `release.yml` (CI), never from a file. A team copying the template needs its own
  licence or replaces these with free `@stackra/ui` components.
- Every `src/` group folder has a README; a new group or file updates its table.
- Strings live in `assets/lang/<locale>/<namespace>.json`; `en` and `ar` are complete, `en-US` and
  `ar-SA` hold only keys that differ.
- `.stackra/` holds generated samples; change `stackra.config.ts` or `src/` and rerun `stackra gen`,
  never edit them. The committed contract is `stackra.manifest.json` at the member root.
- Secrets: forbidden; secret values come from the project's secret store at run time.

## PII

| Data        | Where | Handling                                                                      |
| ----------- | ----- | ----------------------------------------------------------------------------- |
| none stored | —     | Renders what the services return; it keeps only UI preferences on the device. |
