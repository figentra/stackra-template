/**
 * Stackra file contract:
 * Purpose: this app's override of @stackra/consent's configuration: the categories the user decides
 *          on, the policy version that invalidates old decisions, and whether the first launch
 *          asks.
 * Boundary: an override declares `override` members only and inherits the base's key (`consent`);
 *           the package stores the decision with its policy version in the `Prefs` area and the
 *           settings page renders the switches. Each category is a `{ category, required,
 *           defaultGranted }` object over `ConsentCategory` from @stackra/consent (the app defines
 *           no enum of its own), with the hint the switch shows. `ConsentCategory.Necessary` is
 *           required: always granted and never asked; everything else is off until the user turns
 *           it on (decline by default; app-store review requires the choice before tracking).
 * Runtime: react-native
 * Governing contract: ADR 0294 (decision 19, as amended by programming model v3.1, AGENTS.md: Base
 *                     alias), ADR 0298 (decisions 1 and 3), ADR 0071
 */
import { ConsentCategory, ConsentConfig as BaseConsentConfig } from "@stackra/consent";
import { I18n } from "#stackra/i18n";

/** The categories in settings order, the policy version and the first-launch prompt. */
export class ConsentConfig extends BaseConsentConfig {
  /** The categories shown in settings, in order; `Necessary` is required, so it is locked on. */
  override categories: BaseConsentConfig["categories"] = [
    {
      category: ConsentCategory.Necessary,
      required: true,
      defaultGranted: true,
      descriptionKey: I18n.mobile.consent.necessary_hint,
    },
    {
      category: ConsentCategory.Analytics,
      required: false,
      defaultGranted: false,
      descriptionKey: I18n.mobile.consent.analytics_hint,
    },
    {
      category: ConsentCategory.CrashReplay,
      required: false,
      defaultGranted: false,
      descriptionKey: I18n.mobile.consent.crash_replay_hint,
    },
  ];

  /** The consent policy version (`YYYY-MM`); bumping it asks everyone again. */
  override policyVersion = "2026-10";

  /** Ask on the first signed-in launch, before any optional category runs. */
  override askOnFirstLaunch = true;
}
