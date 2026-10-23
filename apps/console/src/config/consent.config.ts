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

/** User consent in the console: the categories asked and the policy version. */
export class ConsentConfig extends BaseConsentConfig {
  /** The categories the settings page asks about, each refused until granted. */
  override categories: BaseConsentConfig["categories"] = [
    {
      category: ConsentCategory.Analytics,
      required: false,
      defaultGranted: false,
    },
  ];

  /** Bumping it asks everyone again. */
  override policyVersion = "2026-10";
}
