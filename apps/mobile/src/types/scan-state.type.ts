/**
 * Stackra file contract:
 * Purpose: what the scan page renders from and feeds: the scanner's phase and the callback the
 *          camera view calls with each decoded code.
 * Boundary: a type only; `useScan` returns it and the `Scan` page reads it.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decision 14, as amended by programming model v3.1, AGENTS.md: one
 *                     declaration per file), ADR 0250
 */
import type { ScanPhase } from "#src/types/scan-phase.type";

/** The result of `useScan`. */
export interface ScanState {
  /** The scanner's current phase. */
  readonly state: ScanPhase;
  /** What the camera view calls with each decoded code. */
  readonly onBarcode: (barcode: string) => void;
}
