<!--
Stackra file contract:
Purpose: the front page of an app made by `stackra create`: what it holds, how to start it and the commands.
Boundary: orientation only; the rules are AGENTS.md, the full tree is docs/template-guide.md and the framework is
          the Stackra docs.
Runtime: none (documentation)
Governing contract: Stackra ADR 0515 (the starter's minimal profile); STA-2877
-->

# acme-platform

A [Stackra](https://docs.stackra.figentra.com) app: a web console and one service with its `notes`
module, on the `@stackra/*` versions `pnpm-workspace.yaml` pins. It is yours: rename, replace or
delete anything here.

## Start

```bash
mise install    # node, pnpm and the tools mise.toml pins
pnpm install    # dependencies, git hooks (lefthook) and .mcp.json
pnpm doctor     # checks this machine for what the app needs
pnpm dev        # the console and the API on this machine
```

## What is here

| Path                  | What it is                                                                   |
| --------------------- | ---------------------------------------------------------------------------- |
| `apps/console`        | the web console: the panel shell that renders what the services declare      |
| `services/example`    | the example service with its `notes` module (actions, model, migration)      |
| `runway.yaml`         | the product key, environments and where each one runs                        |
| `pnpm-workspace.yaml` | members, catalogs (every version) and the install policy                     |
| `AGENTS.md`           | the programming model v3.1 and the rules coding agents follow                |
| `.mcp.yaml`           | the MCP servers for coding agents (Stackra, Encore and HeroUI)               |
| `.github/workflows`   | the Quality Gate on every pull request and every push to `main`              |
| `docs/`               | the template guide: the tree, file ownership and what to replace             |

## Commands

| Command                | What it does                                                          |
| ---------------------- | --------------------------------------------------------------------- |
| `pnpm dev`             | runs the app locally                                                  |
| `pnpm new <kind> <n>`  | adds a member (a service, package or app) in the programming model    |
| `pnpm gen`             | regenerates the manifests, the wiring and the clients after a change  |
| `pnpm verify`          | format, lint, typecheck, test, build, gen check, validate             |
| `pnpm db:migrate`      | applies the services' migrations                                      |
| `pnpm infra`           | previews the infrastructure `runway.yaml` describes                   |
| `pnpm changeset`       | records a release note when a published package changes               |

## Deploy

`runway.yaml` says where each environment runs. Set your own accounts there, then
`stackra infra preview` and `stackra deploy`; the
[Stackra docs](https://docs.stackra.figentra.com) cover each target. Add a deploy workflow under
`.github/workflows` once you have chosen one; the Quality Gate needs no secret.

## Licence

The starter code is MIT ([LICENSE](LICENSE)); the bundled Stackra brand images, fonts and
paid-licence code are excluded, see [NOTICE](NOTICE). Your own code is yours to licence.
