/**
 * Stackra file contract:
 * Purpose: one fact: consent. The categories a visitor decides on, the cookie the decision is
 *          stored in, the policy version that invalidates old decisions, and the regional default.
 * Boundary: values only; the banner and `@stackra/consent` do the work. `necessary` is always
 *           granted and never asked. A cookie, not localStorage, so the server can render the
 *           banner state and the Worker can vary on it.
 * Runtime: isomorphic
 * Governing contract: the `@stackra/consent` package contract (decline is the default)
 */
import { Config } from "@stackra/config";
import { ConsentCategory, ConsentRegime } from "@stackra/consent";
import { Bool, Int, List, Map, Nested, OneOf, Str } from "@stackra/validation";
import { I18n } from "#stackra/i18n";

/** One category the banner explains. */
class Category {
  /** Which category. */
  @OneOf(ConsentCategory) category = ConsentCategory.Necessary;
  /** Whether the visitor may refuse it. @defaultValue false */
  @Bool() required = false;
  /** Granted before the visitor chooses. @defaultValue false */
  @Bool() defaultGranted = false;
  /** What the category is for, as an i18n key. */
  descriptionKey = I18n.web.consent.necessary;
}

/** Visitor consent: the categories, where the decision is stored and the policy version. */
@Config("web.consent")
export class ConsentConfig {
  /** The categories shown, `necessary` first and always granted. */
  @List(Nested(Category)) categories: Category[] = [
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
  /** The cookie holding the decision. @defaultValue "consent" */
  @Str() cookieName = "consent";
  /** How long a decision is kept. @defaultValue 180 */
  @Int({ min: 1, max: 395 }) expiryDays = 180;
  /** Bumping it asks everyone again. @defaultValue "2026-10" */
  @Str({ pattern: /^\d{4}-\d{2}$/ }) policyVersion = "2026-10";
  /** Default regime per region when no choice is stored; `default` covers the rest. */
  @Map(OneOf(ConsentRegime)) regionDefaults: Record<string, ConsentRegime> = {
    default: ConsentRegime.Gdpr,
  };
  /** Treat the browser's Global Privacy Control signal as a refusal. @defaultValue true */
  @Bool() respectGlobalPrivacyControl = true;
}
