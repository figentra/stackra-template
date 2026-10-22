/**
 * Stackra file contract:
 * Purpose: one fact: consent on the device. The categories the user decides on, the policy version
 *          that invalidates old decisions, and whether the first launch asks.
 * Boundary: values only; @stackra/consent stores the decision in the `Prefs` area and the settings
 *           page renders the switches. `ConsentCategory.Necessary` is always granted and never
 *           asked; everything else is off until the user turns it on (app-store review requires the
 *           choice before tracking).
 * Runtime: react-native
 * Governing contract: ADR 0071
 */
import { Config } from "@stackra/config";
import { Bool, List, OneOf, Str } from "@stackra/validation";
import { ConsentCategory } from "#src/enums/consent-category.enum";

/** The categories, their defaults and the policy version. */
@Config("mobile.consent")
export class ConsentConfig {
  /** The categories shown in settings, in order; `Necessary` is listed but locked on. */
  @List(OneOf(ConsentCategory)) categories = [
    ConsentCategory.Necessary,
    ConsentCategory.Analytics,
    ConsentCategory.CrashReplay,
  ];
  /** Bumping it asks everyone again. @defaultValue "2026-10" */
  @Str({ pattern: /^\d{4}-\d{2}$/ }) policyVersion = "2026-10";
  /** Ask on the first signed-in launch, before any optional category runs. @defaultValue true */
  @Bool() askOnFirstLaunch = true;
}
