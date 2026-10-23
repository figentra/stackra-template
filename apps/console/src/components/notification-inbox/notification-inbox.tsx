/**
 * Stackra file contract:
 * Purpose: the top bar's in-app inbox: a bell with the unread count and a sheet listing the
 *          notifications the notifications service delivered, each with a "mark read" action.
 * Boundary: presentation over `useNotificationInbox()`, with the console's loading, empty and error
 *           states, and a "load more" button while older notifications exist. An entry's text is
 *           its kind's derived label (`messages::enums.inbox_message_kind.<code>`), interpolated
 *           with the entry's `data`, in the user's locale; the badge shows the service's inbox-wide
 *           unread count. A refused mark-read is a toast, and the entry stays unread. A class
 *           component; gen compiles it to a function component.
 * Runtime: browser
 * Governing contract: ADR 0139 (feedback), ADR 0140 (error envelope), ADR 0294 (as amended by
 *                     programming model v3.1, AGENTS.md: class components)
 */
import { Sheet } from "@heroui-pro/react";
import { useDateTime, useLocale, useTranslation } from "@stackra/i18n/react";
import { Badge, Button, Description, Icon, toast } from "@stackra/ui/react";
import { Component } from "#stackra/ui";
import { I18n } from "#stackra/i18n";
import { EmptyView } from "#src/components/empty-view";
import { ErrorState } from "#src/components/error-state";
import { LoadingState } from "#src/components/loading-state";
import { useNotificationInbox } from "./use-notification-inbox";

/** The trigger and the sheet; one instance in the shell. */
export class NotificationInbox extends Component {
  /** The translator of the active locale. */
  i18n = useTranslation();

  /** Formats an instant in the user's locale and time zone. */
  formatDateTime = useDateTime();

  /** The inbox's entries, paging state and calls. */
  inbox = useNotificationInbox();

  /** The writing direction, so the sheet slides in from the inline end in both directions. */
  locale = useLocale();

  /** Marks one entry read; a refusal becomes a toast and the entry stays unread. */
  async markRead(inboxMessageId: string) {
    try {
      await this.inbox.markRead(inboxMessageId);
    } catch {
      toast.danger(this.i18n.t(I18n.console.inbox.mark_read_failed));
    }
  }

  /** Whether the first answer arrived without an error and held nothing. */
  get isEmpty() {
    return !this.inbox.isLoading && this.inbox.error === null && this.inbox.items.length === 0;
  }

  /** The bell with its badge, and the sheet with the list. */
  render() {
    const { t } = this.i18n;
    const inbox = this.inbox;
    return (
      <Sheet placement={this.locale.direction === "rtl" ? "left" : "right"}>
        <Sheet.Trigger>
          <Button
            variant="tertiary"
            size="sm"
            isIconOnly
            aria-label={t(I18n.console.inbox.open, { count: inbox.unread })}
          >
            <Badge content={inbox.unread || undefined} color="accent">
              <Icon name="bell" aria-hidden />
            </Badge>
          </Button>
        </Sheet.Trigger>
        <Sheet.Backdrop>
          <Sheet.Content>
            <Sheet.Dialog>
              <Sheet.CloseTrigger aria-label={t(I18n.console.shell.close)} />
              <Sheet.Header>
                <Sheet.Heading>{t(I18n.console.inbox.title)}</Sheet.Heading>
              </Sheet.Header>
              <Sheet.Body>
                {inbox.isLoading && <LoadingState label={I18n.console.inbox.loading} />}
                {inbox.error !== null && <ErrorState error={inbox.error} onRetry={inbox.retry} />}
                {this.isEmpty && (
                  <EmptyView
                    title={I18n.console.inbox.empty_title}
                    description={I18n.console.inbox.empty_body}
                    icon="bell"
                  />
                )}
                {inbox.items.map((item) => (
                  <article key={item.id} className="flex flex-col gap-1 py-2">
                    <strong className={item.readAt ? "font-normal" : undefined}>
                      {t(I18n.messages.enums.inbox_message_kind[item.kind], item.data)}
                    </strong>
                    <div className="flex items-center gap-2">
                      <Description>{this.formatDateTime(item.createdAt)}</Description>
                      {item.readAt === null && (
                        <Button size="sm" variant="tertiary" onPress={() => this.markRead(item.id)}>
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
            </Sheet.Dialog>
          </Sheet.Content>
        </Sheet.Backdrop>
      </Sheet>
    );
  }
}
