/**
 * Stackra file contract:
 * Purpose: the "Pending changes" control: a badge with the queue count in the top bar and a sheet
 *          listing queued and conflicting mutations with their resolutions.
 * Boundary: presentation over `usePendingChanges()`. Conflicts show the action's label, the local
 *           intent and the server state side by side; the strategies offered are the ones the
 *           action declared. Nothing here edits the queue storage directly.
 * Runtime: browser
 * Governing contract: ADR 0252, ADR 0059 decision 3, ADR 0128
 */
import { Sheet } from "@stackra-pro/ui";
import { Tone } from "@stackra/contracts";
import { Badge, Button, Chip, Description } from "@stackra/ui";
import { useTranslation, useDateTime } from "@stackra/i18n/react";
import { Icon, Icons } from "@stackra/ui/icons";
import { EmptyView } from "#src/components/empty-view";
import { usePendingChanges } from "./use-pending-changes";
import { I18n } from "#stackra/i18n";

/** The trigger badge and the sheet; one instance in the shell. */
export function PendingChanges() {
  const { t } = useTranslation();
  const formatDateTime = useDateTime();
  const { items, conflicts, isSyncing, strategiesFor, resolve, discard, syncNow } =
    usePendingChanges();
  const total = items.length + conflicts.length;

  return (
    <Sheet>
      <Sheet.Trigger>
        <Button
          variant="tertiary"
          size="sm"
          isIconOnly
          aria-label={t(I18n.console.queue.open, { count: total })}
        >
          <Badge content={total || undefined} color={conflicts.length ? Tone.Danger : Tone.Warning}>
            <Icon name={Icons.CloudArrowUp} aria-hidden />
          </Badge>
        </Button>
      </Sheet.Trigger>
      <Sheet.Content side="end" aria-label={t(I18n.console.queue.title)}>
        <Sheet.Header>
          <Sheet.Title>{t(I18n.console.queue.title)}</Sheet.Title>
        </Sheet.Header>
        <Sheet.Body id="pending-changes">
          {total === 0 && (
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
                  {t(I18n.console.queue.reason[conflict.reason.value])}
                </Chip>
                <span>{t(conflict.labelKey)}</span>
              </div>
              <Description>{t(I18n.console.queue.conflict_hint)}</Description>
              <div className="flex gap-2">
                {strategiesFor(conflict).map((strategy) => (
                  <Button
                    key={strategy.value}
                    size="sm"
                    variant="secondary"
                    onPress={() => resolve(conflict, strategy)}
                  >
                    {t(I18n.console.queue.strategy[strategy.value])}
                  </Button>
                ))}
                <Button
                  size="sm"
                  variant="tertiary"
                  color={Tone.Danger}
                  onPress={() => discard(conflict)}
                >
                  {t(I18n.console.queue.strategy.discard)}
                </Button>
              </div>
            </article>
          ))}
        </Sheet.Body>
        <Sheet.Footer>
          <Button onPress={syncNow} isPending={isSyncing} isDisabled={items.length === 0}>
            {t(I18n.console.queue.sync_now)}
          </Button>
        </Sheet.Footer>
      </Sheet.Content>
    </Sheet>
  );
}
