/**
 * Stackra file contract:
 * Purpose: the app root boots from the generated wiring with the native drivers; every override
 *          shadows a declared point; every widget component point the hosted panel names is bound
 *          here or has a default tile.
 * Boundary: unit tier on the client container: no device, no network; drivers are the memory fakes
 *           of each port.
 * Runtime: react-native
 * Governing contract: ADR 0022, ADR 0263
 */
import { bootstrapClient } from "@stackra/app/native";
import { createTestingModule } from "@stackra/container/testing";
import { OverrideKind } from "@stackra/panel";
import { Platform } from "@stackra/platform";
import { Storage } from "@stackra/storage";
import { describe, expect, it } from "@stackra/testing";
import { MobileApp } from "#src/mobile.app";
import { overrides } from "#stackra/overrides";
import { widgets } from "#stackra/widgets";
import { wiring } from "#stackra/wiring";

/** The root boots and gen's cross-checks hold. */
describe("MobileApp", () => {
  /** The storage and platform ports resolve by type from the native wiring. */
  it("boots with the generated wiring and the native drivers", async () => {
    const container = await bootstrapClient(MobileApp, {
      wiring,
      drivers: createTestingModule.fakes(),
    });
    expect(container.has(Storage)).toBe(true);
    expect(container.has(Platform)).toBe(true);
  });

  /**
   * An undeclared override is a gen error, so a build that passed gen has `declared: true`
   * everywhere.
   */
  it("shadows only declared override points", () => {
    for (const entry of overrides) expect(entry.declared).toBe(true);
  });

  /**
   * A widget whose point this app does not bind renders through the panel's default tile, never a
   * hole.
   */
  it("binds every widget component point, or leaves it to the default tile", () => {
    const bound = new Set(
      overrides.filter((o) => o.kind === OverrideKind.Component).map((o) => o.point),
    );
    for (const entry of widgets) expect(bound.has(entry.component) || entry.hasDefault).toBe(true);
  });
});
