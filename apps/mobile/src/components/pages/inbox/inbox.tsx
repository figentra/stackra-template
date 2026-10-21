/**
 * Stackra file contract:
 * Purpose: the inbox page: the unread count as an ICU plural, then the user's notifications, newest
 *          first, each as its kind's label interpolated with its data.
 * Boundary: composition of the hook beside it and the shared states; the count uses the full CLDR
 *           plural set in Arabic (`I18n.mobile.inbox.unread`).
 * Runtime: react-native
 * Governing contract: ADR 0062, ADR 0080, ADR 0192
 */
import { useDateTime, useTranslation } from "@stackra/i18n/react";
import type { RouteComponent } from "@stackra/navigation/native";
import { Card } from "@stackra/ui/native";
import { FlatList, Text, View } from "react-native";
import { useInbox } from "#src/components/pages/inbox/use-inbox";
import { ScreenState } from "#src/components/ui/screen-state";
import type { InboxRoute } from "#src/routes/inbox.route";
import { I18n } from "#stackra/i18n";

/** The inbox list. */
export const InboxPage: RouteComponent<typeof InboxRoute> = () => {
  const { t } = useTranslation();
  const dateTime = useDateTime();
  const inbox = useInbox();

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
          {t(I18n.mobile.inbox.unread, { count: inbox.unread })}
        </Text>
      }
      ListEmptyComponent={
        <ScreenState
          kind="empty"
          title={I18n.mobile.inbox.empty}
          hint={I18n.mobile.inbox.empty_hint}
        />
      }
      renderItem={({ item }) => (
        <Card testID={`inbox-${item.id}`}>
          <Card.Body className="gap-1">
            <Card.Title>{t(item.kind.label, item.data)}</Card.Title>
            <Text className="text-xs text-ink-muted">
              {dateTime(item.createdAt, { dateStyle: "medium", timeStyle: "short" })}
            </Text>
          </Card.Body>
        </Card>
      )}
      onEndReached={inbox.loadMore}
      onEndReachedThreshold={0.5}
    />
  );
};
