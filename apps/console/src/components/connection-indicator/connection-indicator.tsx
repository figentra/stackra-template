/**
 * Stackra file contract:
 * Purpose: the top bar's realtime indicator: a dot and a hidden label saying whether live updates
 *          are arriving.
 * Boundary: presentation over the realtime package's connection, which `createApp` mounts from the
 *           realtime config (it connects for a signed-in session and joins the active tenant's
 *           channel). It never reconnects itself: the package backs off and retries. A
 *           `role="status"` so a lost connection is announced once. A class component; gen compiles
 *           it to a function component.
 * Runtime: browser
 * Governing contract: ADR 0225 (broadcast), ADR 0295 (decision 10), ADR 0294 (as amended by
 *                     programming model v3.1, AGENTS.md: class components)
 */
import { Tone } from "@stackra/contracts";
import { useTranslation } from "@stackra/i18n/react";
import { RealtimeStatus } from "@stackra/realtime";
import { useRealtimeConnection } from "@stackra/realtime/react";
import { Chip, Component } from "@stackra/ui";
import { I18n, type I18nKey } from "#stackra/i18n";

/** Status code → label and chip colour; the record type makes a missing case a type error. */
const LOOK: Record<RealtimeStatus, { readonly label: I18nKey; readonly color: Tone }> = {
  [RealtimeStatus.Connected]: { label: I18n.console.realtime.connected, color: Tone.Success },
  [RealtimeStatus.Connecting]: { label: I18n.console.realtime.connecting, color: Tone.Warning },
  [RealtimeStatus.Disconnected]: { label: I18n.console.realtime.disconnected, color: Tone.Danger },
};

/** A small chip; signed out or with the socket down it reads as disconnected. */
export class ConnectionIndicator extends Component {
  /** The translator of the active locale. */
  i18n = useTranslation();

  /** The realtime connection, or `null` while signed out. */
  connection = useRealtimeConnection();

  /** The label and colour of the current status. */
  get look() {
    return LOOK[this.connection?.status ?? RealtimeStatus.Disconnected];
  }

  /** The chip; the label is visible from the medium breakpoint and always read aloud. */
  render() {
    return (
      <Chip role="status" size="sm" variant="dot" color={this.look.color}>
        <span className="sr-only md:not-sr-only">{this.i18n.t(this.look.label)}</span>
      </Chip>
    );
  }
}
