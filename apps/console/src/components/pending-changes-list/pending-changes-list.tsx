/**
 * Stackra file contract:
 * Purpose: the offline queue as a list: queued and conflicting mutations with their resolutions and
 *          a "sync now" button; the pending-changes sheet and the settings page both render it.
 * Boundary: presentation over `usePendingChanges()`. Conflicts show the action's label, the reason
 *           and the resolutions the action declared; discarding a local change asks first, because
 *           it cannot be undone. Nothing here edits the queue storage directly. A class component;
 *           gen compiles it to a function component.
 * Runtime: browser
 * Governing contract: ADR 0252, ADR 0059 decision 3, ADR 0294 (as amended by programming model
 *                     v3.1, AGENTS.md: class components)
 */
import { Tone } from "@stackra/contracts";
import { useDateTime, useTranslation } from "@stackra/i18n/react";
import { AlertDialog, Button, Chip, Description } from "@stackra/ui/react";
import { Component } from "#stackra/ui";
import { I18n } from "#stackra/i18n";
import { EmptyView } from "#src/components/empty-view";
import { usePendingChanges } from "./use-pending-changes";

/** The queue's entries and conflicts, then the sync button; an empty state when nothing waits. */
export class PendingChangesList extends Component {
  /** The translator of the active locale. */
  i18n = useTranslation();

  /** Formats an instant in the user's locale and time zone. */
  formatDateTime = useDateTime();

  /** The queue's entries, conflicts and the calls on them. */
  queue = usePendingChanges();

  /** The pending rows, the conflict rows with their resolutions, then the sync button. */
  render() {
    const { t } = this.i18n;
    const formatDateTime = this.formatDateTime;
    const { items, conflicts, isSyncing, strategiesFor, resolve, discard, syncNow } = this.queue;
    return (
      <div className="flex flex-col gap-2">
        {items.length + conflicts.length === 0 && (
          <EmptyView
            title={I18n.console.queue.empty_title}
            description={I18n.console.queue.empty_body}
          />
        )}
        {items.map((entry) => (
          <article
            key={entry.id}
            aria-label={t(entry.labelKey)}
            className="flex items-center gap-3 py-2"
          >
            <Chip size="sm">{t(I18n.console.queue.pending)}</Chip>
            <span>{t(entry.labelKey)}</span>
            <Description className="ms-auto">{formatDateTime(entry.queuedAt)}</Description>
          </article>
        ))}
        {conflicts.map((conflict) => (
          <article
            key={conflict.id}
            aria-label={t(conflict.labelKey)}
            className="flex flex-col gap-2 py-2"
          >
            <div className="flex items-center gap-3">
              <Chip size="sm" color={Tone.Danger}>
                {t(I18n.console.queue.reason[conflict.reason])}
              </Chip>
              <span>{t(conflict.labelKey)}</span>
            </div>
            <Description>{t(I18n.console.queue.conflict_hint)}</Description>
            <div className="flex gap-2">
              {strategiesFor(conflict).map((strategy) => (
                <Button
                  key={strategy}
                  size="sm"
                  variant="secondary"
                  onPress={() => resolve(conflict, strategy)}
                >
                  {t(I18n.console.queue.strategy[strategy])}
                </Button>
              ))}
              <AlertDialog>
                <Button size="sm" variant="tertiary" color={Tone.Danger}>
                  {t(I18n.console.queue.strategy.discard)}
                </Button>
                <AlertDialog.Backdrop>
                  <AlertDialog.Container size="sm">
                    <AlertDialog.Dialog>
                      <AlertDialog.Header>
                        <AlertDialog.Icon status="danger" />
                        <AlertDialog.Heading>
                          {t(I18n.console.queue.discard_confirm_title)}
                        </AlertDialog.Heading>
                      </AlertDialog.Header>
                      <AlertDialog.Body>
                        <p>{t(I18n.console.queue.discard_confirm_body)}</p>
                      </AlertDialog.Body>
                      <AlertDialog.Footer>
                        <Button slot="close" variant="tertiary">
                          {t(I18n.console.queue.discard_keep)}
                        </Button>
                        <Button slot="close" variant="danger" onPress={() => discard(conflict)}>
                          {t(I18n.console.queue.strategy.discard)}
                        </Button>
                      </AlertDialog.Footer>
                    </AlertDialog.Dialog>
                  </AlertDialog.Container>
                </AlertDialog.Backdrop>
              </AlertDialog>
            </div>
          </article>
        ))}
        <Button
          className="mt-2 self-start"
          onPress={syncNow}
          isPending={isSyncing}
          isDisabled={items.length === 0}
        >
          {t(I18n.console.queue.sync_now)}
        </Button>
      </div>
    );
  }
}
