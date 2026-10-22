/**
 * Stackra file contract:
 * Purpose: the one tsdown preset every library's `tsdown.config.ts` calls: `export default libraryPreset()`.
 *          ESM only as `dist/*.mjs` + `.d.mts` (Stackra ADR 0025), maps, sourcemaps, clean dist,
 *          tree-shaking. The optional decorators flag turns on the legacy-decorator transform.
 * Boundary: builds the configuration object; it does not run the build. The name follows the tooling
 *           role vocabulary (`libraryPreset`, as in @stackra/vitest-config).
 * Runtime: node
 * Governing contract: Stackra ADR 0025 (build output), Stackra ADR 0005 (legacy decorators)
 */
import { defineConfig, type UserConfig } from "tsdown";

/** Options accepted by {@link libraryPreset}. */
export interface LibraryPresetOptions {
  /**
   * Transpile TypeScript experimental (legacy) decorators in the built output. No `design:*` metadata is
   * emitted (ADR-0005): Encore's esbuild bundler cannot emit it, so no code may depend on it.
   *
   * Mechanism (tsdown 0.23 / rolldown): oxc does this natively through rolldown's `transform.decorator` —
   * `legacy` is `experimentalDecorators`. The flags are set explicitly rather than left to tsconfig
   * discovery so a package that passes a custom tsconfig still builds correctly. Pair with
   * `@stackra/typescript-config/library`; rolldown then sees the same flags twice and reports an
   * equal-value CONFIGURATION_FIELD_CONFLICT, which is filtered below.
   *
   * @defaultValue `false`
   */
  decorators?: boolean;
  /** Mark packages external even if they are dependencies (rare: peer-provided runtimes). */
  external?: (string | RegExp)[];
}

const DECORATOR_CONFLICT = /`transform\.decorator`/;

/** The function form of `UserConfig["inputOptions"]`, which tsdown shallow-merges. */
type InputOptionsFn = Extract<
  NonNullable<UserConfig["inputOptions"]>,
  (...args: never[]) => unknown
>;

/**
 * Rolldown input options hook that adds the legacy decorator transform and suppresses the expected config conflict.
 * Rolldown reports CONFIGURATION_FIELD_CONFLICT when both tsconfig and inputOptions set `transform.decorator`,
 * but this is safe and expected here since we pair with `@stackra/typescript-config/library`.
 *
 * tsdown shallow-merges `inputOptions`, so the function form is required to add `transform.decorator`
 * without dropping the `target` / `define` / `inject` tsdown already derived.
 */
const withDecorators: InputOptionsFn = (input) => ({
  ...input,
  transform: {
    ...input.transform,
    decorator: { legacy: true, emitDecoratorMetadata: false },
  },
  onLog: (level, log, defaultHandler) => {
    if (log.code === "CONFIGURATION_FIELD_CONFLICT" && DECORATOR_CONFLICT.test(log.message)) return;
    if (input.onLog) input.onLog(level, log, defaultHandler);
    else defaultHandler(level, log);
  },
});

/**
 * Build configuration for a TypeScript library using tsdown + rolldown.
 *
 * Produces ESM output with declaration files, sourcemaps, clean dist, and tree-shaking enabled.
 * By default, builds a single `src/index.ts` barrel; pass `entries` to build subpath exports.
 *
 * @param entries - Map of output names to source entry points. Default: `{ index: "src/index.ts" }`.
 *        Example: `{ index: "src/index.ts", react: "src/react/index.ts" }`.
 * @param options - Build options (decorator support, external packages).
 * @returns the tsdown configuration object, ready to be the default export of `tsdown.config.ts`.
 * @example
 * export default libraryPreset(); // src/index.ts → dist/index.mjs + index.d.mts
 * @example
 * export default libraryPreset({ index: "src/index.ts", react: "src/react/index.ts" }); // subpath exports
 * @example
 * export default libraryPreset(undefined, { decorators: true }); // legacy decorators, no metadata
 */
export function libraryPreset(
  entries: Record<string, string> = { index: "src/index.ts" },
  options: LibraryPresetOptions = {},
) {
  return defineConfig({
    entry: entries,
    format: ["esm"],
    fixedExtension: true, // ADR 0025: dist/*.mjs + .d.mts, whatever the package "type"
    platform: "neutral",
    dts: true,
    sourcemap: true,
    clean: true,
    treeshake: true,
    ...(options.external ? { external: options.external } : {}),
    ...(options.decorators ? { inputOptions: withDecorators } : {}),
  });
}
