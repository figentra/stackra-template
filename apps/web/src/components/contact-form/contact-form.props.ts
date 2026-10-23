/**
 * Stackra file contract:
 * Purpose: the Props of `ContactForm`: what the route passes back after a POST, and the plan the
 *          visitor came from.
 * Boundary: a type only; the errors are i18n keys, never English text.
 * Runtime: browser
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md: Props in
 *                     `<name>.props.ts`)
 */
import type { I18nKey } from "#stackra/i18n";

/** What the route passes back after a POST, and where the visitor came from. */
export interface ContactFormProps {
  /** Field name → i18n key, from the submit's 400. */
  readonly fieldErrors?: Readonly<Record<string, I18nKey>>;
  /** An i18n key for a form-level refusal, from the submit's 422. */
  readonly formError?: I18nKey;
  /** The plan key from `?plan=` when the visitor came from "contact sales". */
  readonly plan?: string;
}
