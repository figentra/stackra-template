/**
 * Proves `libraryPreset(entries)` returns the agreed shape (ESM, dts, sourcemap, clean, treeshake)
 * for the entries it is given, and that the decorators flag installs the inputOptions hook which
 * adds the legacy transform and swallows only the known conflict log.
 */
import { describe, expect, it, vi } from "vitest";
import { libraryPreset } from "../index.ts";

type Resolved = {
  entry: Record<string, string>;
  format: string[];
  dts: unknown;
  sourcemap: unknown;
  clean: unknown;
  treeshake: unknown;
  inputOptions?: (i: Record<string, unknown>) => Record<string, unknown>;
};

describe("@stackra/tsdown-config libraryPreset()", () => {
  it("builds exactly the entries it is given, with the agreed options", () => {
    const entries = { index: ".stackra/entry/index.ts", node: ".stackra/entry/node.ts" };
    const cfg = libraryPreset(entries) as unknown as Resolved;
    expect(cfg.entry).toEqual(entries);
    expect(cfg.format).toEqual(["esm"]);
    expect(cfg.dts).toBe(true);
    expect(cfg.sourcemap).toBe(true);
    expect(cfg.clean).toBe(true);
    expect(cfg.treeshake).toBe(true);
    expect(cfg.inputOptions).toBeUndefined();
  });

  it("decorators: true adds the legacy transform (no metadata) and filters the duplicate-flag log", () => {
    const cfg = libraryPreset(
      { index: ".stackra/entry/index.ts" },
      { decorators: true },
    ) as unknown as Resolved;
    expect(cfg.inputOptions).toBeTypeOf("function");
    if (!cfg.inputOptions) throw new Error("unreachable: asserted above");
    const out = cfg.inputOptions({ transform: { target: "es2022" } }) as {
      transform: {
        decorator: { legacy: boolean; emitDecoratorMetadata: boolean };
        target: string;
      };
      onLog: (
        level: string,
        log: { code: string; message: string },
        d: (...a: unknown[]) => void,
      ) => void;
    };
    expect(out.transform.decorator).toEqual({
      legacy: true,
      emitDecoratorMetadata: false,
    });
    expect(out.transform.target).toBe("es2022");
    const handler = vi.fn();
    out.onLog(
      "warn",
      {
        code: "CONFIGURATION_FIELD_CONFLICT",
        message: "`transform.decorator` set twice",
      },
      handler,
    );
    expect(handler).not.toHaveBeenCalled();
    out.onLog("warn", { code: "OTHER", message: "x" }, handler);
    expect(handler).toHaveBeenCalledOnce();
  });
});
