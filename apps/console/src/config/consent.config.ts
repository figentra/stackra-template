/**
 * Stackra file contract:
 * Purpose: the console's override of @stackra/consent's configuration: the categories a user
 *          decides on in settings and the policy version that invalidates old decisions.
 * Boundary: an override declares `override` members only and inherits the base's key (`consent`).
 *           Values only; the settings page and the package do the work. Nothing is granted until
 *           the user decides, and `necessary` is always granted and never asked (ADR 0298). The
 *           decision is per user and device, in the prefs store the console's target map gives the
 *           consent store. The class keeps the base's name and imports the base as
 *           `BaseConsentConfig`; a second override of the same base fails gen.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decision 19; as amended by programming model v3.1, AGENTS.md: the
 *                     Base alias), ADR 0298 (decline by default, policy version)
 */
import { ConsentCategory, ConsentConfig as BaseConsentConfig } from "@stackra/consent";
import { I18n } from "#stackra/i18n";

/** User consent in the console: the categories asked and the policy version. */
export class ConsentConfig extends BaseConsentConfig {
  /**
   * The categories in settings order: `Necessary` is required, so always granted; the others are
   * refused until the user grants them on the privacy tab.
   */
  override categories: BaseConsentConfig["categories"] = [
    {
      category: ConsentCategory.Necessary,
      required: true,
      defaultGranted: true,
      descriptionKey: I18n.pages.settings.necessary_consent_hint,
    },
    {
      category: ConsentCategory.Analytics,
      required: false,
      defaultGranted: false,
      descriptionKey: I18n.pages.settings.analytics_consent_hint,
    },
    {
      category: ConsentCategory.CrashReplay,
      required: false,
      defaultGranted: false,
      descriptionKey: I18n.pages.settings.crash_replay_consent_hint,
    },
  ];

  /** Bumping it asks everyone again. */
  override policyVersion = "2026-10";
}
