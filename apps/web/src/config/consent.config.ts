/**
 * Stackra file contract:
 * Purpose: the site's override of @stackra/consent's configuration: the categories a visitor
 *          decides on, the cookie the decision is stored in, the policy version that invalidates
 *          old decisions and the regional defaults.
 * Boundary: an override declares `override` members only and inherits the base's key (`consent`).
 *           Values only; the banner and the package do the work. Nothing but the decision cookie is
 *           set and no analytics event is sent until the visitor decides; `necessary` is always
 *           granted and never asked, and a browser sending Global Privacy Control has refused. The
 *           decision is read and written in the browser only: the server never renders the banner
 *           state and no HTML GET response sets the cookie, so cached pages stay shared. A region
 *           with no default here declines.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decision 19), ADR 0298 (decisions 1 to 4 and 6)
 */
import { ConsentCategory, ConsentConfig, ConsentRegime } from "@stackra/consent";
import { I18n } from "#stackra/i18n";

/** Visitor consent: the categories, where the decision is stored and the policy version. */
export class WebConsentConfig extends ConsentConfig {
  /** The categories the banner explains, `necessary` first and always granted. */
  override categories: ConsentConfig["categories"] = [
    {
      category: ConsentCategory.Necessary,
      required: true,
      defaultGranted: true,
      descriptionKey: I18n.web.consent.necessary,
    },
    {
      category: ConsentCategory.Analytics,
      required: false,
      defaultGranted: false,
      descriptionKey: I18n.web.consent.analytics_category,
    },
  ];

  /** The cookie holding the decision and the policy version it answered. */
  override cookieName = "consent";

  /** How long a decision is kept, in days. */
  override expiryDays = 180;

  /** Bumping it asks everyone again. */
  override policyVersion = "2026-10";

  /** The regime per region when no decision is stored; `default` covers the rest. */
  override regionDefaults: Record<string, ConsentRegime> = {
    default: ConsentRegime.Gdpr,
  };
}
