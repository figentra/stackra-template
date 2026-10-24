/**
 * Stackra file contract:
 * Purpose: the strip at the top of a page while offline or while queued writes wait: the count and
 *          a retry button.
 * Boundary: a presentational class component; its state is the `use-offline-banner.ts` hook
 *           beside it, read as a hook field. Hidden when online with an empty queue, so pages
 *           mount it unconditionally. It takes no props, so it has no Props file.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decision 14, as amended by programming model v3.1, AGENTS.md: class
 *                     components), ADR 0059, ADR 0252
 */
import { useTranslation } from "@stackra/i18n/react";
import { Alert, Button } from "@stackra/ui/native";
import { Component } from "#stackra/ui";
import { useOfflineBanner } from "#src/components/offline-banner/use-offline-banner";
import { I18n } from "#stackra/i18n";

/**
 * The banner. Renders `null` when there is nothing to say.
 */
export class OfflineBanner extends Component {
  /** The translator of the active locale. */
  i18n = useTranslation();

  /** Network state and the queue's counters. */
  banner = useOfflineBanner();

  /** Whether there is anything to tell the user. */
  get isSilent() {
    const { isOnline, pending, conflicts } = this.banner;
    return isOnline && pending === 0 && conflicts === 0;
  }

  /** The alert with the offline or pending line, the conflicts line and the retry. */
  render() {
    if (this.isSilent) return null;
    const { t } = this.i18n;
    const { isOnline, pending, conflicts, retry } = this.banner;

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
}
