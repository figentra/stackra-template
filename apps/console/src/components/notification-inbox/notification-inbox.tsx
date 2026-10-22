/**
 * Stackra file contract:
 * Purpose: the top bar's in-app inbox: a bell with the unread count and a sheet listing the
 *          notifications the notifications service delivered, each with a "mark read" action.
 * Boundary: presentation over `useNotificationInbox()`, with the console's loading, empty and error
 *           states, and a "load more" button while older notifications exist. An entry's text is
 *           its kind's label, interpolated with the entry's `data`, in the user's locale; the badge
 *           shows the service's inbox-wide unread count. A refused mark-read is a toast, and the
 *           entry stays unread.
 * Runtime: browser
 * Governing contract: ADR 0139 (feedback), ADR 0140 (error envelope)
 */
import { Sheet } from "@stackra-pro/ui";
import { useDateTime, useTranslation } from "@stackra/i18n/react";
import { Badge, Button, Description, toast } from "@stackra/ui";
import { Icon, Icons } from "@stackra/ui/icons";
import { I18n } from "#stackra/i18n";
import { EmptyView } from "#src/components/empty-view";
import { ErrorState } from "#src/components/error-state";
import { LoadingState } from "#src/components/loading-state";
import { useNotificationInbox } from "./use-notification-inbox";

/** The trigger and the sheet; one instance in the shell. */
export function NotificationInbox() {
  const { t } = useTranslation();
  const formatDateTime = useDateTime();
  const inbox = useNotificationInbox();
  const markRead = (notificationId: string) =>
    inbox
      .markRead(notificationId)
      .catch(() => toast.danger(t(I18n.console.inbox.mark_read_failed)));

  return (
    <Sheet>
      <Sheet.Trigger>
        <Button
          variant="tertiary"
          size="sm"
          isIconOnly
          aria-label={t(I18n.console.inbox.open, { count: inbox.unread })}
        >
          <Badge content={inbox.unread || undefined} color="accent">
            <Icon name={Icons.Bell} aria-hidden />
          </Badge>
        </Button>
      </Sheet.Trigger>
      <Sheet.Content side="end" aria-label={t(I18n.console.inbox.title)}>
        <Sheet.Header>
          <Sheet.Title>{t(I18n.console.inbox.title)}</Sheet.Title>
        </Sheet.Header>
        <Sheet.Body>
          {inbox.isLoading && <LoadingState label={I18n.console.inbox.loading} />}
          {inbox.error !== null && <ErrorState error={inbox.error} onRetry={inbox.retry} />}
          {!inbox.isLoading && inbox.error === null && inbox.items.length === 0 && (
            <EmptyView
              title={I18n.console.inbox.empty_title}
              description={I18n.console.inbox.empty_body}
              icon={Icons.Bell}
            />
          )}
          {inbox.items.map((item) => (
            <article key={item.id} className="flex flex-col gap-1 py-2">
              <strong className={item.readAt ? "font-normal" : undefined}>
                {t(item.kind.label, item.data)}
              </strong>
              <div className="flex items-center gap-2">
                <Description>{formatDateTime(item.createdAt)}</Description>
                {item.readAt === null && (
                  <Button size="sm" variant="tertiary" onPress={() => markRead(item.id)}>
                    {t(I18n.console.inbox.mark_read)}
                  </Button>
                )}
              </div>
            </article>
          ))}
          {inbox.hasMore && (
            <Button
              variant="secondary"
              size="sm"
              isPending={inbox.isLoadingMore}
              onPress={inbox.loadMore}
              className="mt-2 self-center"
            >
              {t(I18n.console.inbox.load_more)}
            </Button>
          )}
        </Sheet.Body>
      </Sheet.Content>
    </Sheet>
  );
}
