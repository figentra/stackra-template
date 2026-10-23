/**
 * Stackra file contract:
 * Purpose: the consent categories this app asks the user about, as one closed set.
 * Boundary: an enum (`Enum.of`, the `enum` keyword is banned): each case is its stored code. The
 *           label is the derived key `mobile::enums.consent_category.<code>`; the hint the settings
 *           page shows under it is meta. `Necessary` is always granted and never asked.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 16 and 20), ADR 0298, ADR 0071, ADR 0231
 */
import { Enum } from "@stackra/validation";
import { I18n } from "#stackra/i18n";

/** `Enum.meta(ConsentCategory, code).hint` is the line under the switch. */
export const ConsentCategory = Enum.of({
  /** Sign-in, the session and the offline queue; the app cannot run without them. */
  Necessary: ["necessary", { hint: I18n.mobile.consent.necessary_hint }],
  /** Product analytics events (`analytics.track`). */
  Analytics: ["analytics", { hint: I18n.mobile.consent.analytics_hint }],
  /** Session replay attached to a crash report. */
  CrashReplay: ["crash_replay", { hint: I18n.mobile.consent.crash_replay_hint }],
});

/** One of the codes above. */
export type ConsentCategory = Enum.Value<typeof ConsentCategory>;
