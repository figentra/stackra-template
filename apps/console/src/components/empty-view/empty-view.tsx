/**
 * Stackra file contract:
 * Purpose: the console's one empty state: a title, a line of help and an optional primary action.
 * Boundary: presentation; takes i18n keys, never literal strings, so every empty state is
 *           translated. Wraps HeroUI Pro's `EmptyState` so the panel renderer's empty tables and
 *           the app's own pages look the same.
 * Runtime: browser
 * Governing contract: ADR 0080 decision 1 (keys, never literals), ADR 0128
 */
import type { ReactNode } from "react";
import { EmptyState } from "@stackra-pro/ui";
import { useTranslation } from "@stackra/i18n/react";
import { Icon, Icons } from "@stackra/ui/icons";
import type { I18nKey } from "#stackra/i18n";

/** What an empty state says. */
export interface EmptyViewProps {
  /** The one line that says what is missing, as a key so every empty state is translated. */
  readonly title: I18nKey;
  /** What the user can do about it. */
  readonly description?: I18nKey;
  /** Decorative icon; hidden from assistive tech. @defaultValue Icons.Inbox */
  readonly icon?: Icons;
  /** A single primary action (a button or link), rendered under the text. */
  readonly action?: ReactNode;
  /** Tighter spacing for use inside a sidebar header or a card. @defaultValue false */
  readonly compact?: boolean;
}

/**
 * Centred block; `role="status"` is not used because an empty list is not a change to announce.
 */
export function EmptyView({
  title,
  description,
  icon = Icons.Inbox,
  action,
  compact = false,
}: EmptyViewProps) {
  const { t } = useTranslation();
  return (
    <EmptyState className={compact ? "py-2" : "py-12"}>
      <EmptyState.Media>
        <Icon name={icon} aria-hidden />
      </EmptyState.Media>
      <EmptyState.Header>
        <EmptyState.Title>{t(title)}</EmptyState.Title>
        {description && <EmptyState.Description>{t(description)}</EmptyState.Description>}
      </EmptyState.Header>
      {action && <EmptyState.Content>{action}</EmptyState.Content>}
    </EmptyState>
  );
}
