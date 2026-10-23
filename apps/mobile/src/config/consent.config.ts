/**
 * Stackra file contract:
 * Purpose: this app's override of @stackra/consent's configuration: the categories the user
 *          decides on, the policy version that invalidates old decisions, and whether the first
 *          launch asks.
 * Boundary: an override declares `override` members only and inherits the base's key (`consent`);
 *           the package stores the decision with its policy version in the `Prefs` area and the
 *           settings page renders the switches. `ConsentCategory.Necessary` is always granted and
 *           never asked; everything else is off until the user turns it on (decline by default;
 *           app-store review requires the choice before tracking).
 * Runtime: react-native
 * Governing contract: ADR 0294 (decision 19), ADR 0298 (decisions 1 and 3), ADR 0071
 */
import { ConsentConfig } from "@stackra/consent";
import { ConsentCategory } from "#src/enums/consent-category.enum";

/** The categories in settings order, the policy version and the first-launch prompt. */
export class MobileConsentConfig extends ConsentConfig {
  /** The categories shown in settings, in order; `Necessary` is listed but locked on. */
  override categories: ConsentCategory[] = [
    ConsentCategory.Necessary,
    ConsentCategory.Analytics,
    ConsentCategory.CrashReplay,
  ];

  /** The consent policy version (`YYYY-MM`); bumping it asks everyone again. */
  override policyVersion = "2026-10";

  /** Ask on the first signed-in launch, before any optional category runs. */
  override askOnFirstLaunch = true;
}
