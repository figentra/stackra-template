# Owner review: the Stackra reference template

This folder is the one place to review the whole programming model before it is locked. It is a preview, not a
working repo: nothing is installed, and every `@stackra/*` import names a package that does not exist yet. Each name it
uses is listed in the API contract (`api-surface.md` in the owner's notes), so approving the template approves that
contract too.

## What to read, in order (about two hours)

The same order as `README.md` ("Reading order"), with what each step asks you to approve.

| #   | Read                                                                                                                             | What you are approving                                                                                  |
| --- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 1   | `AGENTS.md`                                                                                                                      | The glossary of kinds, the renamed terms and the rules every member follows                             |
| 2   | `services/commerce/src/modules/orders/README.md`, then `actions/create-order.action.ts` and `workflows/create-order.workflow.ts` | The service model: decorated actions, models, migrations, policies, events, workflows, seeds, tests     |
| 3   | `services/commerce/src/modules/loyalty/hooks/redeem-points.hook.ts`                                                              | Extending another module through a hook point                                                           |
| 4   | `services/commerce/.stackra/gen/wiring.ts` and `hooks.ts`                                                                        | What gen derives from the declarations                                                                  |
| 5   | `services/notifications/README.md`                                                                                               | Reaching another service (event, call, command); notifications as a service (ADR 0223)                  |
| 6   | `packages/commerce/loyalty-kit/README.md`, `packages/security/access-log/README.md`                                              | A capability kit and a decorator package; packages target realms, not app panels                        |
| 7   | `apps/console/README.md`, then root `runway.yaml` and `apps/console/runway.yaml`                                                 | An app: routes, panels, flags, the generated entry; links point down; infrastructure in the root runway |
| 8   | `apps/docs/src/guides/add-a-field.mdx`                                                                                           | The first change every newcomer makes, from the model to the test                                       |

Then, as time allows: `apps/web/src/` (public site, SEO, PWA, per-tenant brand) and `apps/mobile/src/` (code-based
navigation, tabs declared on routes, offline queue, Arabic plurals).

In each member's `.stackra/` folder, `app-manifest.json` (and a service's `openapi.json`) is committed in a real repo:
it is the contract other members build from. Everything else there (`gen/`, configs, entries, `lang/`) is gitignored in
a real repo and shown here only so you can read the output next to the source.

## Decided since you last looked (2026-10-21)

- Decorators everywhere; `define*` only in `stackra.config.ts`. Drivers self-register (`@Driver`, `@DriverOf`, `@Replaces`).
- ADR 0223: no `@stackra/forms` (forms use `@stackra/ui/form`), no `@stackra/notifications` package (it is a service, ADR 0223).
- pwa and network fold into `@stackra/platform`; router folds into `@stackra/navigation`; no templates package.
- Navigation links point down only: a route may reference its layout and page by class; layouts, menus and pages refer
  to routes by generated keys (`Routes.dashboard`). Tabs and menus are generated from the routes.
- `@Flag` lives in `@stackra/feature-flags`; the model money column is `@MoneyColumn`; `Money` is the value class.
- Test files may import a sibling module's factories and models.
- Inbound-email cancel ships with its three safeguards (signed webhook, DKIM/SPF plus verified email, judged as the customer).
- Builder architecture (ADR 0270) and saved views (ADR 0271) are merged; the template does not build an editor yet.

## Decided by default — please confirm

- **Packages target realms, not app panels.** A package's resources, widgets, settings pages and documents declare
  `realms: [Realm.TenantAdmin]` (`Realm` from `@stackra/contracts`); each app panel declares the realms it hosts
  (`@Panel({ key, realms: [...] })`), and gen places package contributions into every panel hosting their realm.
- **Console reaches HeroUI Pro only through `@stackra-pro/ui`** (ADR 0113), never `@heroui-pro/react` directly.
- **`renderRoute` takes a route key** (`renderRoute(Routes.inbox, …)`), like every other navigation API.
- **Workflows:** the decorator is `@Workflow()` on a class that `extends WorkflowBase` (the base class no longer shares
  the decorator's name).
- **Closed sets are enums** everywhere, including `Idempotency.Required`, `MigrationMode.ForwardOnly`,
  `MigrationRunner.Auto`, `ActionColor.Danger` and `SessionStatus.SignedIn`.

## Known limits of the preview

- Static checks only: formatting, JSON, catalog and import resolution, wire keys against manifests, i18n key parity,
  and a zero-cycle scan of the navigation imports. No typecheck or tests run until the packages exist.
- A few API shapes are assumed and listed in the contract: `eventRef(…, { channel })`, `Page(View, { unread })`,
  `upload(…, { label })`, `ctx.captcha`.
- Language files for producers outside this repo (`queue`, `settings`, `experience`, `theming`, `leads`) hold only
  the keys the apps use, with placeholder Arabic and English text.
- Generated migration headers fail the docblock checker until its exemption lands (STA-252).

## How to give feedback

Write comments anywhere (in chat, or as `// OWNER:` lines in the files). Each comment becomes either a fix in the
template or a decision recorded in an ADR. When you approve, the template becomes the golden reference members in the
repo (STA-223) and the plan locks.
