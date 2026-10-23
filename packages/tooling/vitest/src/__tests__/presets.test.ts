/**
 * Proves the presets compose: the decorators preset keeps the base options and adds the oxc decorator flags
 * without metadata emission or setup files (ADR-0005); the react preset switches the environment to jsdom; each
 * member factory lays out the projects its docblock promises.
 */
import { describe, expect, it } from "vitest";
import {
  appPreset,
  libraryPreset,
  mobilePreset,
  servicePreset,
  toolingPreset,
} from "../factories.ts";
import { stackraVitest } from "../preset.ts";
import { stackraVitestDecorators } from "../preset-decorators.ts";
import { stackraVitestReact } from "../preset-react.ts";

interface Project {
  extends?: boolean;
  test: { name: string; environment?: string; include: string[]; exclude?: string[] };
}

const projects = (config: { test?: { projects?: unknown } }) => config.test?.projects as Project[];
const decorator = (config: object) =>
  (config as { oxc?: { decorator?: Record<string, boolean> } }).oxc?.decorator;

describe("@stackra/vitest-config", () => {
  it("base preset refuses empty suites and enables globals", () => {
    expect(stackraVitest.test?.globals).toBe(true);
    expect(stackraVitest.test?.passWithNoTests).toBe(false);
  });

  it("decorators preset adds the legacy decorator transform without metadata or setup files", () => {
    expect(decorator(stackraVitestDecorators)?.legacy).toBe(true);
    expect(decorator(stackraVitestDecorators)?.emitDecoratorMetadata).toBe(false);
    expect(stackraVitestDecorators.test?.setupFiles).toBeUndefined();
    expect(stackraVitestDecorators.test?.globals).toBe(true);
  });

  it("react preset runs in jsdom", () => {
    expect(stackraVitestReact.test?.environment).toBe("jsdom");
  });

  it("servicePreset splits unit and int tests and keeps decorators on", () => {
    const config = servicePreset({ root: "/member" });
    expect(config.root).toBe("/member");
    expect(decorator(config)?.legacy).toBe(true);
    const [unit, int] = projects(config);
    expect(unit?.extends).toBe(true);
    expect(unit?.test.include).toEqual(["src/**/__tests__/**/*.test.ts"]);
    expect(unit?.test.exclude).toContain("src/**/__tests__/**/*.int.test.ts");
    expect(int?.test.include).toEqual(["src/**/__tests__/**/*.int.test.ts"]);
  });

  it("libraryPreset adds the coverage gate and a jsdom project for the react folder", () => {
    expect(libraryPreset({ root: "/lib" }).test?.coverage?.thresholds).toMatchObject({ lines: 80 });
    expect(projects(libraryPreset({ root: "/lib" }))).toHaveLength(2);
    const react = projects(libraryPreset({ root: "/lib", react: "src/react" })).at(-1);
    expect(react?.test).toMatchObject({ name: "react", environment: "jsdom" });
    expect(react?.test.include).toEqual(["src/react/**/__tests__/**/*.test.tsx"]);
  });

  it("appPreset runs jsdom except in the node folders, and honours exclude", () => {
    const config = appPreset({
      root: "/app",
      nodeFolders: ["src/bridges"],
      exclude: ["**/*.e2e.test.ts"],
    });
    expect(config.test?.environment).toBe("jsdom");
    expect(decorator(config)?.legacy).toBe(true);
    const [dom, node] = projects(config);
    expect(dom?.test.exclude).toEqual(
      expect.arrayContaining(["src/bridges/**", "**/*.e2e.test.ts"]),
    );
    expect(node?.test).toMatchObject({ name: "src/bridges", environment: "node" });
  });

  it("mobilePreset runs every test file in jsdom with decorators", () => {
    const config = mobilePreset({ root: "/mobile" });
    expect(config.test?.environment).toBe("jsdom");
    expect(config.test?.include).toEqual(["src/**/__tests__/**/*.test.{ts,tsx}"]);
    expect(decorator(config)?.legacy).toBe(true);
  });

  it("toolingPreset runs the preset packages' own tests in plain Node and refuses an empty suite", () => {
    expect(toolingPreset.test).toMatchObject({
      environment: "node",
      include: ["src/**/__tests__/**/*.test.ts"],
      passWithNoTests: false,
    });
    expect(decorator(toolingPreset)).toBeUndefined();
    expect(toolingPreset.test?.coverage).toBeUndefined();
  });
});
