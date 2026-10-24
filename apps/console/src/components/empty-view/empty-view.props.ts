/**
 * Stackra file contract:
 * Purpose: `EmptyViewProps`: what the console's one empty state takes.
 * Boundary: a props type only, beside its component; text arrives as i18n keys and the icon as an
 *           `IconName`, never an icon component.
 * Runtime: browser
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md: props files and
 *                     icon names), ADR 0080 decision 1
 */
import type { ReactNode } from "react";
import type { IconName } from "@stackra/icons/contracts";
import type { I18nKey } from "#stackra/i18n";

/** What an empty state says. */
export interface EmptyViewProps {
  /** The one line that says what is missing, as a key so every empty state is translated. */
  readonly title: I18nKey;
  /** What the user can do about it. */
  readonly description?: I18nKey;
  /**
   * Decorative icon; hidden from assistive tech.
   *
   * @defaultValue "inbox"
   */
  readonly icon?: IconName;
  /** A single primary action (a button or link), rendered under the text. */
  readonly action?: ReactNode;
  /**
   * Tighter spacing for use inside a sidebar header or a card.
   *
   * @defaultValue false
   */
  readonly compact?: boolean;
}
