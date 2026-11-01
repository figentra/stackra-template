<!-- Rendered by figentra-flow from .flow/readme.yml (stackra preset, STA-1879). Edit the data file, then run `figentra-flow readme`. -->

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/assets/brand/banner-dark.png" />
    <img src=".github/assets/brand/banner-light.png" alt="Stackra template" width="640" />
  </picture>
</p>

<h1 align="center">Stackra template</h1>

<p align="center"><strong>The starting workspace for a new Stackra product (services, packages, docs).</strong></p>

<p align="center">
  <a href="https://github.com/figentra/stackra-template/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/figentra/stackra-template/actions/workflows/ci.yml/badge.svg?branch=main" /></a>
  <a href="https://github.com/figentra/stackra-template/releases/latest"><img alt="Release" src="https://img.shields.io/badge/release-latest-blue" /></a>
  <a href="https://github.com/figentra/stackra-template/blob/main/LICENSE"><img alt="Licence: MIT" src="https://img.shields.io/badge/licence-MIT-green" /></a>
  <a href="https://github.com/figentra/stackra-template#status"><img alt="Status: In progress" src="https://img.shields.io/badge/status-In%20progress-orange" /></a>
  <a href="https://docs.stackra.figentra.com"><img alt="Docs" src="https://img.shields.io/badge/docs-read-0a7bd6" /></a>
</p>

## What it is

Stackra is a TypeScript framework for products that ship one backend to many surfaces. You declare
behaviour as kind classes (actions, queries, models, events, routes), each extending the base of its
kind in the folder of its kind, and `stackra gen` derives the rest: the identities, the dependency
wiring, the HTTP and MCP endpoints, typed clients for every consumer, the runtime entries and the
tool configs for web, PWA, desktop and mobile.

This repository is the **lean starter** for a product repository, in the programming model v3.1: the
root config, the docs site, one example service and one example package. It is a starting point, not
a sample product. Both examples are written by `stackra new` and nothing else, and `pnpm validate`
fails when they drift from what `stackra new` writes today. The tool presets are the core
`@stackra/*-config` packages, from `catalog:stackra`. Products ship packages and add apps only when
they need one (D16). The placeholder product is **Acme** (`product.key: acme` in `runway.yaml`).
Nothing generated is committed: `.stackra/` is gitignored and `stackra gen` writes it.

The full guide (the programming model, the tree, which file owns which fact, how each member kind is
created, the test layout and what to replace) is [docs/template-guide.md](docs/template-guide.md).

## Status

**In progress**: the lean starter, on the `@stackra/*` 0.3.0 catalog.

The states: **Live** (serving customers), **In progress** (being built), **Planned** (no build yet).

## Quick start

1. Click **Use this template** on GitHub, then clone your new repository.
2. Run:

   ```sh
   mise install                 # node, pnpm, gitleaks, infisical, maestro, encore, eas-cli, pinned
   pnpm install                 # dependencies, git hooks (lefthook) and .mcp.json (`stackra mcp sync`)
   stackra agents setup         # once per machine: Stackra skills, sub-agents and guard hooks for your assistant
   pnpm gen && pnpm dev         # generate .stackra/ and run every member
   pnpm verify                  # the gate CI runs
   ```

3. Replace the example identity, see [Make it yours](docs/template-guide.md#make-it-yours), then
   rename or delete the examples (see
   [How each member kind is created](docs/template-guide.md#how-each-member-kind-is-created)).

## Architecture at a glance

| Path                               | What it holds                                                                           |
| ---------------------------------- | --------------------------------------------------------------------------------------- |
| `services/example`                 | `@figentra/acme-service-example`: the example service, as `stackra new` wrote it        |
| `packages/application/example`     | `@figentra/acme-example`: the example package, with console, native and landing entries |
| `apps/docs`                        | Mintlify docs: guides, ADRs and the API reference generated from manifests              |
| `assets/`                          | brand, mobile, store, landing and lang sources (ADR 0441)                               |
| `runway.yaml`, `stackra.lock.yaml` | product key, infrastructure and topology; pinned external producer manifests            |

> **The path says the kind, the base class is the kind, the type gives the shape, and the names give
> identity.** Actions are the only behaviour; gen derives the identities, locks them in
> `stackra.manifest.json` and writes the wiring, the entries and the tool configs.

The full annotated tree, the reading order and the package map are in the
[template guide](docs/template-guide.md#tree); the grammar and rules are in [AGENTS.md](AGENTS.md).
The bundled Stackra brand images, fonts and paid-licence code are excluded from the MIT licence: see
[NOTICE](NOTICE).

## Development

```bash
pnpm install
pnpm verify
```

`pnpm verify` is the full check: CI and the gate run the same command.

Changes go through [Figentra Flow](https://github.com/figentra/flow), the `figentra-flow` CLI.

Every branch and pull request carries a Linear `STA-` key.

| Step                          | Command                                                       |
| ----------------------------- | ------------------------------------------------------------- |
| Spec the change               | `/flow-specify`, `/flow-clarify`, `/flow-plan`, `/flow-tasks` |
| Start a worktree for an issue | `figentra-flow start STA-<n>`                                 |
| Run the gate on the branch    | `figentra-flow gate run`                                      |
| Land the pull request         | `figentra-flow land`                                          |
| See specs, worktrees and PRs  | `figentra-flow status`                                        |
| Re-render this README         | `figentra-flow readme`                                        |

## Docs and playground

- **Docs**: <https://docs.stackra.figentra.com>

## Release and changelog

Every change that ships carries a changeset in `.changeset/`.

Merging the version pull request that Changesets opens cuts the release.

The notes are in [Releases][releases] and in each package's `CHANGELOG.md`.

[releases]: https://github.com/figentra/stackra-template/releases

## Security

Report a vulnerability privately, as the [security policy][security] describes.

Never report one in a public issue or pull request.

[security]: https://github.com/figentra/stackra-template/security/policy

## Licence

Released under the MIT licence. See [LICENSE](LICENSE).

---

<p align="center"><sub>Stackra template is made by Figentra Technologies L.L.C · <a href="https://figentra.com">figentra.com</a></sub></p>
