/**
 * Stackra file contract:
 * Purpose: the top bar's realtime indicator: a dot and a hidden label saying whether live updates
 *          are arriving.
 * Boundary: presentation over `useRealtime`; it never reconnects itself (the realtime package backs
 *           off and retries). A `role="status"` so a lost connection is announced once.
 * Runtime: browser
 * Governing contract: ADR 0225 (broadcast)
 */
import { Tone } from "@stackra/contracts";
import { useTranslation } from "@stackra/i18n/react";
import { RealtimeStatus } from "@stackra/realtime";
import { Chip } from "@stackra/ui";
import { I18n, type I18nKey } from "#stackra/i18n";
import { useRealtime } from "#src/providers/realtime/use-realtime";

/** Status code → label and chip colour; the record type makes a missing case a type error. */
const LOOK: Record<RealtimeStatus["value"], { label: I18nKey; color: Tone }> = {
  [RealtimeStatus.Connected.value]: { label: I18n.console.realtime.connected, color: Tone.Success },
  [RealtimeStatus.Connecting.value]: {
    label: I18n.console.realtime.connecting,
    color: Tone.Warning,
  },
  [RealtimeStatus.Disconnected.value]: {
    label: I18n.console.realtime.disconnected,
    color: Tone.Danger,
  },
};

/** A small chip; the colour is decoration, the text is what assistive tech reads. */
export function ConnectionIndicator() {
  const { t } = useTranslation();
  const { status } = useRealtime();
  const look = LOOK[status.value];
  return (
    <Chip role="status" size="sm" variant="dot" color={look.color}>
      <span className="sr-only md:not-sr-only">{t(look.label)}</span>
    </Chip>
  );
}
