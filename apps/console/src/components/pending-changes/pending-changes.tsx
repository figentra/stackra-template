/**
 * Stackra file contract:
 * Purpose: the top bar's "Pending changes" control: a badge with the queue count and a sheet that
 *          shows the queue list.
 * Boundary: the trigger and the sheet only; what the sheet lists and how a conflict is resolved is
 *           `PendingChangesList`, the same list the settings page shows. The count reads the
 *           mutation queue directly.
 * Runtime: browser
 * Governing contract: ADR 0252
 */
import { Sheet } from "@stackra-pro/ui";
import { Tone } from "@stackra/contracts";
import { useTranslation } from "@stackra/i18n/react";
import { useMutationQueue } from "@stackra/query/react";
import { Badge, Button } from "@stackra/ui";
import { Icon, Icons } from "@stackra/ui/icons";
import { I18n } from "#stackra/i18n";
import { PendingChangesList } from "#src/components/pending-changes-list";

/** The trigger badge and the sheet; one instance in the shell. */
export function PendingChanges() {
  const { t } = useTranslation();
  const queue = useMutationQueue();
  const total = queue.items.length + queue.conflicts.length;

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
            <Icon name={Icons.CloudArrowUp} aria-hidden />
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
