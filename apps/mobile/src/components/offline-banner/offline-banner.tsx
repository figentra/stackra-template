/**
 * Stackra file contract:
 * Purpose: the strip at the top of a page while offline or while queued writes wait: the count and
 *          a retry button.
 * Boundary: presentation; state from `use-offline-banner.ts` beside it. Hidden when online with an
 *           empty queue, so pages mount it unconditionally.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decision 14), ADR 0059, ADR 0252
 */
import { useTranslation } from "@stackra/i18n/react";
import { Alert, Button } from "@stackra/ui/native";
import { useOfflineBanner } from "#src/components/offline-banner/use-offline-banner";
import { I18n } from "#stackra/i18n";

/** The banner. Renders `null` when there is nothing to say. */
export function OfflineBanner() {
  const { t } = useTranslation();
  const { isOnline, pending, conflicts, retry } = useOfflineBanner();
  if (isOnline && pending === 0 && conflicts === 0) return null;

  return (
    <Alert status={isOnline ? "warning" : "default"} testID="offline-banner">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>
          {isOnline
            ? t(I18n.mobile.offline.pending, { count: pending })
            : t(I18n.mobile.offline.banner)}
        </Alert.Title>
        {conflicts > 0 ? (
          <Alert.Description>
            {t(I18n.mobile.offline.conflicts, { count: conflicts })}
          </Alert.Description>
        ) : null}
        {isOnline && pending > 0 ? (
          <Button size="sm" variant="secondary" onPress={retry} className="mt-2 self-start">
            {t(I18n.mobile.offline.retry)}
          </Button>
        ) : null}
      </Alert.Content>
    </Alert>
  );
}
