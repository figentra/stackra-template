/**
 * Stackra file contract:
 * Purpose: the console's one empty state: a title, a line of help and an optional primary action.
 * Boundary: presentation; takes i18n keys, never literal strings, so every empty state is
 *           translated. Wraps HeroUI Pro's `EmptyState` so the panel renderer's empty tables and
 *           the app's own pages look the same. A class component; gen compiles it to a function
 *           component.
 * Runtime: browser
 * Governing contract: ADR 0080 decision 1 (keys, never literals), ADR 0128, ADR 0294 (as amended by
 *                     programming model v3.1, AGENTS.md: class components)
 */
import { EmptyState } from "@heroui-pro/react";
import { useTranslation } from "@stackra/i18n/react";
import { Component } from "#stackra/ui";
import { Icon } from "@stackra/ui/react";
import type { EmptyViewProps } from "./empty-view.props";

/**
 * Centred block; `role="status"` is not used because an empty list is not a change to announce.
 */
export class EmptyView extends Component<EmptyViewProps> {
  /** The translator of the active locale. */
  i18n = useTranslation();

  /** The body of the empty state. */
  render() {
    const { title, description, icon = "inbox", action, compact = false } = this.props;
    return (
      <EmptyState size={compact ? "sm" : "md"}>
        <EmptyState.Media variant="icon">
          <Icon name={icon} aria-hidden />
        </EmptyState.Media>
        <EmptyState.Header>
          <EmptyState.Title>{this.i18n.t(title)}</EmptyState.Title>
          {description && (
            <EmptyState.Description>{this.i18n.t(description)}</EmptyState.Description>
          )}
        </EmptyState.Header>
        {action && <EmptyState.Content>{action}</EmptyState.Content>}
      </EmptyState>
    );
  }
}
