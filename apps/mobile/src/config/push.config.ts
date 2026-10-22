/**
 * Stackra file contract:
 * Purpose: one fact: push notifications. The provider, how a notification shows while the app is
 *          open, the Android channels, and the moment the OS prompt is first shown.
 * Boundary: values only. The device is registered by the push provider through
 *           `Devices.actions.RegisterDevice`, which the provider names itself: a config field never
 *           holds a generated descriptor. The OS prompt is the platform driver's. Push is optional:
 *           a refusal never blocks the app.
 * Runtime: react-native
 * Governing contract: ADR 0062, ADR 0180, ADR 0235, ADR 0250
 */
import { Config, DriverOf, Env } from "@stackra/config";
import type { DriverName } from "@stackra/container";
import { PushTransport } from "@stackra/platform/contracts";
import { PromptMoment } from "@stackra/platform";
import { Bool, Int, List, Nested, OneOf, Str, Url } from "@stackra/validation";
import { I18n } from "#stackra/i18n";

/** One Android notification channel; `nameKey` is translated at channel creation. */
class AndroidChannel {
  /** The channel id the service's payload names. */
  @Str() id!: string;
  /** The channel name shown in the OS settings, as a typed key. */
  @Str() nameKey!: string;
  /**
   * Tool-owned: expo-notifications' `AndroidImportance` names, typed by that union. @defaultValue
   * "default"
   */
  @OneOf(["min", "low", "default", "high", "max"]) importance = "default";
  /** Vibrate on arrival. @defaultValue true */
  @Bool() vibrate = true;
  /** Tool-owned: the sound file name, or the platform's `default`. @defaultValue "default" */
  @Str() sound = "default";
}

/** The push transport, foreground presentation, channels and prompt timing. */
@Config("mobile.push")
export class PushConfig {
  /**
   * Which registered push transport runs; set per environment by `EXPO_PUBLIC_PUSH_PROVIDER`.
   * @defaultValue "expo"
   */
  @Env("EXPO_PUBLIC_PUSH_PROVIDER")
  @DriverOf(PushTransport)
  provider: DriverName<PushTransport> = "expo";
  /** Endpoint of a self-hosted relay; absent for Expo. */
  @Url() endpoint?: string;
  /** Registration retries before the app gives up for this launch. @defaultValue 3 */
  @Int({ min: 1 }) retries = 3;
  /** Show a banner for a notification that arrives while the app is open. @defaultValue true */
  @Bool() foregroundBanner = true;
  /** Play the sound for a foreground notification. @defaultValue false */
  @Bool() foregroundSound = false;
  /** Update the badge for a foreground notification. @defaultValue true */
  @Bool() foregroundBadge = true;
  /** The Android channels created at first launch. */
  @List(Nested(AndroidChannel)) androidChannels: AndroidChannel[] = [
    {
      id: "orders",
      nameKey: I18n.mobile.push.channel_orders,
      importance: "high",
      vibrate: true,
      sound: "default",
    },
  ];
  /** When the OS prompt is first shown. @defaultValue PromptMoment.FirstSession */
  @OneOf(PromptMoment) askOn = PromptMoment.FirstSession;
  /** iOS: ask for provisional (quiet) authorization first. @defaultValue false */
  @Bool() iosProvisional = false;
}
