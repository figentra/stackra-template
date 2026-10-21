/**
 * Stackra file contract:
 * Purpose: the top bar's realtime indicator: a dot and a hidden label saying whether live updates
 *          are arriving.
 * Boundary: presentation over `useRealtime`; it never reconnects itself (the realtime package backs
 *           off and retries). A `role="status"` so a lost connection is announced once.
 * Runtime: browser
 * Governing contract: ADR 0225 (broadcast), ADR 0128
 */
import { Tone } from "@stackra/contracts";
import { useTranslation } from "@stackra/i18n/react";
import { RealtimeStatus } from "@stackra/realtime";
import { Chip } from "@stackra/ui";
import { I18n } from "#stackra/i18n";
import { useRealtime } from "#src/providers/realtime/use-realtime";

/** Status → label and chip colour; one row per `RealtimeStatus` case. */
const LOOK = new Map([
  [RealtimeStatus.Connected, { label: I18n.console.realtime.connected, color: Tone.Success }],
  [RealtimeStatus.Connecting, { label: I18n.console.realtime.connecting, color: Tone.Warning }],
  [RealtimeStatus.Disconnected, { label: I18n.console.realtime.disconnected, color: Tone.Danger }],
] as const);

/** A small chip; the colour is decoration, the text is what assistive tech reads. */
export function ConnectionIndicator() {
  const { t } = useTranslation();
  const { status } = useRealtime();
  const look = LOOK.get(status) ?? LOOK.get(RealtimeStatus.Disconnected)!;
  return (
    <Chip role="status" size="sm" variant="dot" color={look.color}>
      <span className="sr-only md:not-sr-only">{t(look.label)}</span>
    </Chip>
  );
}
