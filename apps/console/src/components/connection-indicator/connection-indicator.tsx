/**
 * Stackra file contract:
 * Purpose: the top bar's realtime indicator: a dot and a hidden label saying whether live updates
 *          are arriving.
 * Boundary: presentation over the realtime package's connection, which `createApp` mounts from the
 *           realtime config (it connects for a signed-in session and joins the active tenant's
 *           channel). It never reconnects itself: the package backs off and retries. A
 *           `role="status"` so a lost connection is announced once.
 * Runtime: browser
 * Governing contract: ADR 0225 (broadcast), ADR 0295 (decision 10)
 */
import { Tone } from "@stackra/contracts";
import { useTranslation } from "@stackra/i18n/react";
import { RealtimeStatus } from "@stackra/realtime";
import { useRealtimeConnection } from "@stackra/realtime/react";
import { Chip } from "@stackra/ui";
import { I18n, type I18nKey } from "#stackra/i18n";

/** One status's label and chip colour. */
interface StatusLook {
  /** What assistive tech reads. */
  readonly label: I18nKey;
  /** The dot's colour; decoration only. */
  readonly color: Tone;
}

/** Status code → label and chip colour; the record type makes a missing case a type error. */
const LOOK: Record<RealtimeStatus, StatusLook> = {
  [RealtimeStatus.Connected]: { label: I18n.console.realtime.connected, color: Tone.Success },
  [RealtimeStatus.Connecting]: { label: I18n.console.realtime.connecting, color: Tone.Warning },
  [RealtimeStatus.Disconnected]: {
    label: I18n.console.realtime.disconnected,
    color: Tone.Danger,
  },
};

/** A small chip; signed out or with the socket down it reads as disconnected. */
export function ConnectionIndicator() {
  const { t } = useTranslation();
  const connection = useRealtimeConnection();
  const look = LOOK[connection?.status ?? RealtimeStatus.Disconnected];
  return (
    <Chip role="status" size="sm" variant="dot" color={look.color}>
      <span className="sr-only md:not-sr-only">{t(look.label)}</span>
    </Chip>
  );
}
