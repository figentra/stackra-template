/**
 * Stackra file contract:
 * Purpose: before mount, the push provider applies the foreground rule and creates the Android
 *          channels from `PushConfig`; a target without push is skipped quietly.
 * Boundary: unit tier; the platform fake records the push port's calls; `runHydrate` drives the
 *           class.
 * Runtime: react-native
 * Governing contract: ADR 0022, ADR 0062
 */
import { runHydrate } from "@stackra/navigation/testing";
import { fakePlatform } from "@stackra/platform/testing";
import { describe, expect, it } from "@stackra/testing";
import { PushConfig } from "#src/config/push.config";
import { PushProvider } from "#src/providers/push";

/** The before-mount half of push. */
describe("PushProvider", () => {
  /** A notification arriving during boot is already shown the configured way. */
  it("applies the foreground rule and the channels", async () => {
    const platform = fakePlatform({ push: { permission: "granted" } });
    await runHydrate(PushProvider, { platform });
    const config = new PushConfig();
    expect(platform.push.channels).toEqual(config.androidChannels);
    expect(platform.push.foregroundPresentation).toEqual({
      banner: config.foregroundBanner,
      sound: config.foregroundSound,
      badge: config.foregroundBadge,
    });
  });

  /** Push is optional: no port, no error. */
  it("does nothing on a target without push", async () => {
    await expect(runHydrate(PushProvider, { platform: fakePlatform({}) })).resolves.toBeDefined();
  });
});
