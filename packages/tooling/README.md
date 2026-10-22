# `packages/tooling/`

The shared configuration presets every member extends, tagged `tier:config`. They have no workspace
dependencies and sit at the bottom of the dependency graph (Stackra ADR 0003).

One role vocabulary runs through them: a member is an `app`, `mobile`, `library`, `service` or
`tooling` member, and each preset package names its export after that role
(`@stackra/typescript-config/library`, `libraryPreset` in vitest and tsdown).

| Package                    | Presets for                                                                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| [`typescript`](typescript) | `@stackra/typescript-config`: tsconfig roles (`app`, `mobile`, `library`, `service`, `tooling`)                                             |
| [`oxlint`](oxlint)         | `@stackra/oxlint-config`: oxlint presets, including the boundaries rules                                                                    |
| [`vitest`](vitest)         | `@stackra/vitest-config`: the role presets (`libraryPreset`, `servicePreset`, `appPreset`, `mobilePreset`, `tooling`) and the coverage gate |
| [`tsdown`](tsdown)         | `@stackra/tsdown-config`: the `libraryPreset()` build preset                                                                                |
| [`commitlint`](commitlint) | `@stackra/commitlint-config`: the conventional-commit rules of `.commitlintrc.yaml`                                                         |

## Rules

- A preset is a plain file in the package's `src/`, loaded by plain Node or by the tool itself, so
  imports here keep full specifiers. There is no `src/lib/` layer.
- Every compiler or lint option lives here with its reason; a member's config only extends a preset.
- Changing a preset changes every member: run `pnpm verify`.
- Create one with `pnpm new tooling <name>` (`stackra new`).

Guide: [tooling](https://docs.stackra.figentra.com/guides/tooling).
