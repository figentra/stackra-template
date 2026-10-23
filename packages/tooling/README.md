# `packages/tooling/`

The five shared configuration presets every member extends, tagged `tier:config` (Stackra ADR 0300).
They have no workspace dependencies and sit at the bottom of the dependency graph (Stackra ADR
0003). They are tool configuration and hold no module, so they are the one kind of member with no
`stackra.config.ts`, no root module and no gen (Stackra ADR 0294 rule R12): their own
`vitest.config.ts` and `tsconfig.json` are authored, while every other member's tool configs are
generated into its `.stackra/` (Stackra ADR 0295 decision 5).

One role vocabulary runs through them: a member is an `app`, `mobile`, `library`, `service` or
`tooling` member, and each preset package names its export after that role
(`@stackra/typescript-config/library`, `libraryPreset` in vitest and tsdown).

| Package                    | Presets for                                                                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`typescript`](typescript) | `@stackra/typescript-config`: tsconfig roles (`app`, `mobile`, `library`, `service`, `tooling`)                                                   |
| [`oxlint`](oxlint)         | `@stackra/oxlint-config`: oxlint presets, including the boundaries rules                                                                          |
| [`vitest`](vitest)         | `@stackra/vitest-config`: the role presets (`libraryPreset`, `servicePreset`, `appPreset`, `mobilePreset`, `toolingPreset`) and the coverage gate |
| [`tsdown`](tsdown)         | `@stackra/tsdown-config`: the `libraryPreset(entries)` build preset                                                                               |
| [`commitlint`](commitlint) | `@stackra/commitlint-config`: `commitlintPreset`, the conventional-commit rules of `.commitlintrc.yaml`                                           |

## Rules

- A preset is a plain file in the package's `src/`, loaded by plain Node or by the tool itself, so
  imports here keep full specifiers. There is no `src/lib/` layer.
- Every compiler or lint option lives here with its reason; a member's config only extends a preset.
- The TypeScript presets set `useDefineForClassFields: true` and never `isolatedDeclarations`, the
  class semantics the kind bases rely on (Stackra ADR 0300 decision 6).
- Stackra publishes the same five presets to npm; a project consumes them through `catalog:stackra`
  once they are released, and these workspace copies then go.
- Changing a preset changes every member: run `pnpm verify`.
- Create one with `pnpm new tooling <name>` (`stackra new`).

Guide: [tooling](https://docs.stackra.figentra.com/guides/tooling).
