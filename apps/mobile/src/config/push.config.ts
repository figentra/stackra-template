/**
 * Stackra file contract:
 * Purpose: this app's override of @stackra/platform's push configuration: the transport, how a
 *          notification shows while the app is open, the Android channels, and the moment the OS
 *          prompt is first shown.
 * Boundary: an override declares `override` members only and inherits the base's key; its presence
 *           mounts the push context, so the app writes no push provider. Before the first frame the
 *           package applies the foreground rule and creates the channels; once a session and a
 *           tenant exist it registers the device with the devices module (ADR 0235), queued offline
 *           by the generated offline map, and re-registers on a tenant switch or a locale change; a
 *           tapped notification's deep link opens through the generated linking. Push is optional:
 *           a refusal never blocks the app, and the settings switch offers the prompt again. A
 *           field typed by an enum or a driver name restates its type. `EnvConfig.pushProvider`
 *           (`EXPO_PUBLIC_PUSH_PROVIDER`) feeds `provider` per environment over the default below.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decision 19, as amended by programming model v3.1, AGENTS.md: Base
 *                     alias), ADR 0295 (decision 10), ADR 0062, ADR 0180, ADR 0235, ADR 0250
 */
import type { DriverName } from "@stackra/container";
import {
  NotificationImportance,
  PromptMoment,
  PushConfig as BasePushConfig,
} from "@stackra/platform";
import type { PushTransport } from "@stackra/platform/contracts";
import { I18n } from "#stackra/i18n";

/** Expo push, a quiet foreground banner, one orders channel, asked in the first session. */
export class PushConfig extends BasePushConfig {
  /** The registered push transport; the env value replaces it per environment. */
  override provider: DriverName<PushTransport> = "expo";

  /** Registration retries before the app gives up for this launch. */
  override retries = 3;

  /** Show a banner for a notification that arrives while the app is open. */
  override foregroundBanner = true;

  /** Play the sound for a foreground notification. */
  override foregroundSound = false;

  /** Update the badge for a foreground notification. */
  override foregroundBadge = true;

  /** The Android channels created at first launch; the name is translated at creation. */
  override androidChannels = [
    {
      id: "orders",
      nameKey: I18n.mobile.push.channel_orders,
      importance: NotificationImportance.High,
      vibrate: true,
      sound: "default",
    },
  ];

  /** When the OS prompt is first shown. */
  override askOn: PromptMoment = PromptMoment.FirstSession;

  /** iOS: ask for provisional (quiet) authorization first. */
  override iosProvisional = false;
}
