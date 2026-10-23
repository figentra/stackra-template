/**
 * Stackra file contract:
 * Purpose: the top bar's "Pending changes" control: a badge with the queue count and a sheet that
 *          shows the queue list.
 * Boundary: the trigger and the sheet only; what the sheet lists and how a conflict is resolved is
 *           `PendingChangesList`, the same list the settings page shows. The count reads the
 *           mutation queue directly. A class component; gen compiles it to a function component.
 * Runtime: browser
 * Governing contract: ADR 0252, ADR 0294 (as amended by programming model v3.1, AGENTS.md: class
 *                     components)
 */
import { Sheet } from "@stackra-pro/ui";
import { Tone } from "@stackra/contracts";
import { useTranslation } from "@stackra/i18n/react";
import { useMutationQueue } from "@stackra/query/react";
import { Badge, Button, Component, Icon } from "@stackra/ui";
import { I18n } from "#stackra/i18n";
import { PendingChangesList } from "#src/components/pending-changes-list";

/** The trigger badge and the sheet; one instance in the shell. */
export class PendingChanges extends Component {
  /** The translator of the active locale. */
  i18n = useTranslation();

  /** The offline mutation queue. */
  queue = useMutationQueue();

  /** Queued entries plus conflicts: everything that still needs the user or the network. */
  get total() {
    return this.queue.items.length + this.queue.conflicts.length;
  }

  /** The badge button and the sheet holding the queue list. */
  render() {
    const { t } = this.i18n;
    const queue = this.queue;
    const total = this.total;
    return (
      <Sheet>
        <Sheet.Trigger>
          <Button
            variant="tertiary"
            size="sm"
            isIconOnly
            aria-label={t(I18n.console.queue.open, { count: total })}
          >
            <Badge
              content={total || undefined}
              color={queue.conflicts.length ? Tone.Danger : Tone.Warning}
            >
              <Icon name="cloud-upload" aria-hidden />
            </Badge>
          </Button>
        </Sheet.Trigger>
        <Sheet.Content side="end" aria-label={t(I18n.console.queue.title)}>
          <Sheet.Header>
            <Sheet.Title>{t(I18n.console.queue.title)}</Sheet.Title>
          </Sheet.Header>
          <Sheet.Body>
            <PendingChangesList />
          </Sheet.Body>
        </Sheet.Content>
      </Sheet>
    );
  }
}
