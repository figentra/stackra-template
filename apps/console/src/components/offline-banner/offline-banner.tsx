/**
 * Stackra file contract:
 * Purpose: a strip under the top bar while the API is unreachable, with the number of queued
 *          mutations.
 * Boundary: presentation over `useOnlineStatus` (the app's `hooks/`, shared with the offline page)
 *           and the mutation queue count; it never retries the queue itself (the queue replays on
 *           `online` on its own). A `role="status"` so the change is announced once. A class
 *           component; gen compiles it to a function component.
 * Runtime: browser
 * Governing contract: ADR 0252 (offline on every client), ADR 0139 (declared UX for queued state),
 *                     ADR 0294 (as amended by programming model v3.1, AGENTS.md: class components)
 */
import { useTranslation } from "@stackra/i18n/react";
import { useMutationQueue } from "@stackra/query/react";
import { Alert } from "@stackra/ui/react";
import { Component } from "#stackra/ui";
import { I18n } from "#stackra/i18n";
import { useOnlineStatus } from "#src/hooks/use-online-status";

/** Renders nothing while online; offline it names the count of changes waiting to sync. */
export class OfflineBanner extends Component {
  /** The translator of the active locale. */
  i18n = useTranslation();

  /** Whether the last probe reached the API. */
  isOnline = useOnlineStatus();

  /** The offline mutation queue. */
  queue = useMutationQueue();

  /** The warning strip, or nothing while online. */
  render() {
    if (this.isOnline) return null;
    return (
      <Alert status="warning" role="status" className="rounded-none">
        <Alert.Title>{this.i18n.t(I18n.console.offline.title)}</Alert.Title>
        <Alert.Description>
          {this.i18n.t(I18n.console.offline.body, { count: this.queue.pending })}
        </Alert.Description>
      </Alert>
    );
  }
}
