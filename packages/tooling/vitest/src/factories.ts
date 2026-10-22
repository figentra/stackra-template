/**
 * Stackra file contract:
 * Purpose: the four factories a member's vitest.config.ts calls: `nodePreset` (services), `libraryPreset`
 *          (packages, coverage-gated), `reactPreset` (web apps) and `nativePreset` (the mobile app).
 *          `stackra gen` writes the app configs in `.stackra/` against these same names.
 * Boundary: test layout only (projects, environments, the coverage gate); no setup file, matcher or global
 *           setup is registered here.
 * Runtime: node
 * Governing contract: ADR 0005 (legacy decorators); ADR 0022 (test placement).
 * Owner: release-operations · Secrets: forbidden
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

export interface NodePresetOptions {
  /** The member root, usually `import.meta.dirname`. */
  root: string;
  /** Extra globs no project runs. */
  exclude?: string[];
}

export interface LibraryPresetOptions {
  /** The member root, usually `import.meta.dirname`. */
  root: string;
  /** A source folder whose `.test.tsx` files run in jsdom, for example `src/react`. */
  react?: string;
}

export interface ReactPresetOptions {
  /** The app root (the folder above `.stackra/`). */
  root: string;
  /** Source folders whose tests run in the node environment (Electron main, server code). */
  nodeFolders?: string[];
  /** Extra globs no project runs, for example the Playwright `*.e2e.test.ts` files. */
  exclude?: string[];
}

export interface NativePresetOptions {
  /** The app root (the folder above `.stackra/`). */
  root: string;
}

/** Unit tests (`.test.ts`) and integration tests (`.int.test.ts`) as two projects, legacy decorators on. */
export function nodePreset({ root, exclude = [] }: NodePresetOptions): ViteUserConfig {
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

/** The node preset under the shared coverage gate, plus a jsdom project for the `react` folder. */
export function libraryPreset({ root, react }: LibraryPresetOptions): ViteUserConfig {
  const config = nodePreset({ root });
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
export function reactPreset({
  root,
  nodeFolders = [],
  exclude = [],
}: ReactPresetOptions): ViteUserConfig {
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
export function nativePreset({ root }: NativePresetOptions): ViteUserConfig {
  return mergeConfig(reactWithDecorators, defineConfig({ root, test: { include: [ALL_TESTS] } }));
}
