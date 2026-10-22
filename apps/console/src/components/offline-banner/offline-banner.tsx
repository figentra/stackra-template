/**
 * Stackra file contract:
 * Purpose: a strip under the top bar while the API is unreachable, with the number of queued
 *          mutations.
 * Boundary: presentation over `useOnlineStatus` and the mutation queue count; it never retries the
 *           queue itself (the queue replays on `online` on its own). A `role="status"` so the
 *           change is announced once.
 * Runtime: browser
 * Governing contract: ADR 0252 (offline on every client), ADR 0139 (declared UX for queued state),
 *                     ADR 0128
 */
import { Alert } from "@stackra/ui";
import { useTranslation } from "@stackra/i18n/react";
import { useMutationQueue } from "@stackra/query/react";
import { useOnlineStatus } from "#src/hooks/use-online-status";
import { I18n } from "#stackra/i18n";

/** Renders nothing while online; offline it names the count of changes waiting to sync. */
export function OfflineBanner() {
  const { t } = useTranslation();
  const isOnline = useOnlineStatus();
  const queue = useMutationQueue();
  if (isOnline) return null;
  return (
    <Alert status="warning" role="status" className="rounded-none">
      <Alert.Title>{t(I18n.console.offline.title)}</Alert.Title>
      <Alert.Description>
        {t(I18n.console.offline.body, { count: queue.pending })}
      </Alert.Description>
    </Alert>
  );
}
