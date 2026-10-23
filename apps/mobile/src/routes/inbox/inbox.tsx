/**
 * Stackra file contract:
 * Purpose: the inbox page: the unread count as an ICU plural, then the user's notifications, newest
 *          first, each as its kind's label interpolated with its data.
 * Boundary: a class component bound to `InboxRoute` by its file name, its props typed
 *           `RouteProps<typeof InboxRoute>`; composition of the hook beside it and the shared
 *           states. The kind's label is the producer's derived key
 *           `messages::enums.inbox_message_kind.<code>`; the count uses the full CLDR plural set in
 *           Arabic (`I18n.pages.inbox.unread`).
 * Runtime: react-native
 * Governing contract: ADR 0294 (decisions 7 and 14, as amended by programming model v3.1,
 *                     AGENTS.md: class components), ADR 0062, ADR 0080, ADR 0192
 */
import { useDateTime, useTranslation } from "@stackra/i18n/react";
import type { RouteProps } from "@stackra/navigation/native";
import { Card } from "@stackra/ui/native";
import { Component } from "#stackra/ui";
import { FlatList, Text, View } from "react-native";
import { ScreenState } from "#src/components/screen-state";
import type { InboxRoute } from "#src/routes/inbox/inbox.route";
import { useInbox } from "#src/routes/inbox/use-inbox";
import { I18n } from "#stackra/i18n";

/** The inbox list. */
export class Inbox extends Component<RouteProps<typeof InboxRoute>> {
  /** The translator of the active locale. */
  i18n = useTranslation();

  /** Formats a date and time for the active locale. */
  dateTime = useDateTime();

  /** The loaded entries, the unread count and the paging calls. */
  inbox = useInbox();

  /** The loading or error state first, else the list with its header and empty state. */
  render() {
    const { t } = this.i18n;
    const inbox = this.inbox;

    if (inbox.isLoading)
      return (
        <View className="flex-1 bg-background px-4 pt-2">
          <ScreenState kind="loading" rows={4} />
        </View>
      );
    if (inbox.error && inbox.entries.length === 0)
      return (
        <View className="flex-1 bg-background px-4 pt-2">
          <ScreenState kind="error" error={inbox.error} onRetry={inbox.refresh} />
        </View>
      );

    return (
      <FlatList
        testID="inbox-page"
        contentInsetAdjustmentBehavior="automatic"
        className="flex-1 bg-background"
        contentContainerClassName="gap-3 px-4 pb-16 pt-2"
        data={inbox.entries}
        keyExtractor={(entry) => entry.id}
        ListHeaderComponent={
          <Text className="text-ink-muted" accessibilityRole="header">
            {t(I18n.pages.inbox.unread, { count: inbox.unread })}
          </Text>
        }
        ListEmptyComponent={
          <ScreenState
            kind="empty"
            title={I18n.pages.inbox.empty}
            hint={I18n.pages.inbox.empty_hint}
          />
        }
        renderItem={({ item }) => (
          <Card testID={`inbox-${item.id}`}>
            <Card.Body className="gap-1">
              <Card.Title>
                {t(I18n.messages.enums.inbox_message_kind[item.kind], item.data)}
              </Card.Title>
              <Text className="text-xs text-ink-muted">
                {this.dateTime(item.createdAt, { dateStyle: "medium", timeStyle: "short" })}
              </Text>
            </Card.Body>
          </Card>
        )}
        onEndReached={inbox.loadMore}
        onEndReachedThreshold={0.5}
      />
    );
  }
}
