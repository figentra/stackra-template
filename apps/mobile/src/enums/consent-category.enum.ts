/**
 * Stackra file contract:
 * Purpose: the consent categories this app asks the user about, as one closed set.
 * Boundary: a class enum (`enum` keyword banned); `value` is the stored code, `label` and `hint`
 *           are typed keys the settings page renders. `Necessary` is always granted and never
 *           asked.
 * Runtime: isomorphic
 * Governing contract: ADR 0071, ADR 0128, ADR 0231
 */
import { Enum } from "@stackra/schema";
import { I18n } from "#stackra/i18n";

/** `ConsentCategory.from("analytics")` returns the singleton `ConsentCategory.Analytics`. */
export class ConsentCategory extends Enum<ConsentCategory> {
  /** Sign-in, the session and the offline queue; the app cannot run without them. */
  static readonly Necessary = ConsentCategory.case("necessary", {
    label: I18n.mobile.consent.necessary,
    hint: I18n.mobile.consent.necessary_hint,
  });
  /** Product analytics events (`analytics.track`). */
  static readonly Analytics = ConsentCategory.case("analytics", {
    label: I18n.mobile.consent.analytics,
    hint: I18n.mobile.consent.analytics_hint,
  });
  /** Session replay attached to a crash report. */
  static readonly CrashReplay = ConsentCategory.case("crash_replay", {
    label: I18n.mobile.consent.crash_replay,
    hint: I18n.mobile.consent.crash_replay_hint,
  });
}
