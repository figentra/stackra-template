/**
 * Stackra file contract:
 * Purpose: the role vocabulary a member's vitest.config.ts uses, one export per member role:
 *          `libraryPreset` (packages, coverage-gated), `servicePreset` (services), `appPreset` (the Vite
 *          and React Router apps), `mobilePreset` (the Expo app) and `tooling` (the preset packages'
 *          own tests). `stackra gen` writes the app configs in `.stackra/` against these same names.
 * Boundary: test layout only (projects, environments, the coverage gate); no setup file, matcher or global
 *           setup is registered here.
 * Runtime: node
 * Governing contract: Stackra ADR 0005 (legacy decorators), Stackra ADR 0022 (test placement)
 */
import { configDefaults, defineConfig, mergeConfig, type ViteUserConfig } from "vitest/config";
import { withCoverage } from "./coverage.ts";
import { decoratorTransform, stackraVitestDecorators } from "./preset-decorators.ts";
import { stackraVitestReact } from "./preset-react.ts";

const UNIT_TESTS = "src/**/__tests__/**/*.test.ts";
const INT_TESTS = "src/**/__tests__/**/*.int.test.ts";
const ALL_TESTS = "src/**/__tests__/**/*.test.{ts,tsx}";

/** jsdom plus the decorator transform: the base of the app presets. */
const reactWithDecorators = mergeConfig(stackraVitestReact, decoratorTransform);

/** Options of {@link servicePreset}. */
export interface ServicePresetOptions {
  /** The member root, usually `import.meta.dirname`. */
  root: string;
  /** Extra globs no project runs. */
  exclude?: string[];
}

/** Options of {@link libraryPreset}. */
export interface LibraryPresetOptions {
  /** The member root, usually `import.meta.dirname`. */
  root: string;
  /** A source folder whose `.test.tsx` files run in jsdom, for example `src/react`. */
  react?: string;
}

/** Options of {@link appPreset}. */
export interface AppPresetOptions {
  /** The app root (the folder above `.stackra/`). */
  root: string;
  /** Source folders whose tests run in the node environment (Electron main, server code). */
  nodeFolders?: string[];
  /** Extra globs no project runs, for example the Playwright `*.e2e.test.ts` files. */
  exclude?: string[];
}

/** Options of {@link mobilePreset}. */
export interface MobilePresetOptions {
  /** The app root (the folder above `.stackra/`). */
  root: string;
}

/** Unit tests (`.test.ts`) and integration tests (`.int.test.ts`) as two projects, legacy decorators on. */
export function servicePreset({ root, exclude = [] }: ServicePresetOptions): ViteUserConfig {
  return mergeConfig(
    stackraVitestDecorators,
    defineConfig({
      root,
      test: {
        projects: [
          {
            extends: true,
            test: {
              name: "unit",
              include: [UNIT_TESTS],
              exclude: [...configDefaults.exclude, INT_TESTS, ...exclude],
            },
          },
          {
            extends: true,
            test: {
              name: "int",
              include: [INT_TESTS],
              exclude: [...configDefaults.exclude, ...exclude],
            },
          },
        ],
      },
    }),
  );
}

/** The service layout under the shared coverage gate, plus a jsdom project for the `react` folder. */
export function libraryPreset({ root, react }: LibraryPresetOptions): ViteUserConfig {
  const config = servicePreset({ root });
  if (react === undefined) return withCoverage(config);
  return withCoverage(
    mergeConfig(
      config,
      defineConfig({
        test: {
          projects: [
            {
              extends: true,
              test: {
                name: "react",
                environment: "jsdom",
                include: [`${react}/**/__tests__/**/*.test.tsx`],
              },
            },
          ],
        },
      }),
    ),
  );
}

/** jsdom for every test, except the `nodeFolders`, which get a node-environment project each. */
export function appPreset({
  root,
  nodeFolders = [],
  exclude = [],
}: AppPresetOptions): ViteUserConfig {
  return mergeConfig(
    reactWithDecorators,
    defineConfig({
      root,
      test: {
        projects: [
          {
            extends: true,
            test: {
              name: "jsdom",
              include: [ALL_TESTS],
              exclude: [
                ...configDefaults.exclude,
                ...nodeFolders.map((folder) => `${folder}/**`),
                ...exclude,
              ],
            },
          },
          ...nodeFolders.map((folder) => ({
            extends: true as const,
            test: {
              name: folder,
              environment: "node",
              include: [`${folder}/**/__tests__/**/*.test.ts`],
              exclude: [...configDefaults.exclude, ...exclude],
            },
          })),
        ],
      },
    }),
  );
}

/** jsdom with legacy decorators for the mobile app's `.test.ts` and `.test.tsx` files. */
export function mobilePreset({ root }: MobilePresetOptions): ViteUserConfig {
  return mergeConfig(reactWithDecorators, defineConfig({ root, test: { include: [ALL_TESTS] } }));
}

/**
 * The preset packages' own tests (packages/tooling/*): plain Node, explicit `vitest` imports, no
 * decorators, no coverage gate and no `@stackra/source` resolution, because a preset is loaded as it
 * ships. An empty suite fails. A tooling package's vitest.config.ts is `export default tooling;`.
 */
export const tooling: ViteUserConfig = defineConfig({
  test: { environment: "node", include: [UNIT_TESTS], passWithNoTests: false },
});
