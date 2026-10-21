/**
 * Stackra file contract:
 * Purpose: one fact: consent in the console. The categories a user decides on in settings, where
 *          the decision is kept, and the policy version that invalidates old decisions.
 * Boundary: values only; the settings page and `@stackra/consent` do the work. `necessary` is
 *           always granted and never asked. The decision is per user and device, in the prefs
 *           store.
 * Runtime: isomorphic
 * Governing contract: ADR 0071 (consent before analytics; decline is the default)
 */
import { Config } from "@stackra/config";
import { ConsentCategory } from "@stackra/consent";
import { List, OneOf, Str } from "@stackra/validation";

/** User consent in the console: the categories asked and the policy version. */
@Config("console.consent")
export class ConsentConfig {
  /**
   * Categories the settings page asks about; `necessary` is implied.
   * @defaultValue [ConsentCategory.Analytics]
   */
  @List(OneOf(ConsentCategory)) categories = [ConsentCategory.Analytics];
  /** Bumping it asks everyone again. @defaultValue "2026-10" */
  @Str({ pattern: /^\d{4}-\d{2}$/ }) policyVersion = "2026-10";
}
