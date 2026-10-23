/**
 * Stackra file contract:
 * Purpose: `AttachImagesProps`: the files the attach-images form receives and what it reports.
 * Boundary: a props type only, beside its component; the files come from the share target or the
 *           file handler, already read by their route.
 * Runtime: browser
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md: props files), ADR
 *                     0255 (share target, file handlers)
 */

/** The files to attach and the callback once the run is over. */
export interface AttachImagesProps {
  /** Every file received; those that are not an accepted image are listed and skipped. */
  readonly files: readonly File[];
  /** Called after a run with the number of images attached (0 when every one failed). */
  readonly onAttached?: (attached: number) => void;
}
