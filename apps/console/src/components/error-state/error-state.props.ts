/**
 * Stackra file contract:
 * Purpose: `ErrorStateProps`: what the console's one error state takes.
 * Boundary: a props type only, beside its component.
 * Runtime: browser
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md: props files), ADR
 *                     0140 (error envelope)
 */
import type { ErrorKind } from "@stackra/errors";

/** What an error state needs. */
export interface ErrorStateProps {
  /** Whatever was thrown; a refusal renders by kind, anything else as `unknown`. */
  readonly error: unknown;
  /** The kind when the caller knows it without a refusal (a router 404); wins over the error's. */
  readonly kind?: ErrorKind;
  /** Called by the retry button; absent means no button (for example, a 403). */
  readonly onRetry?: () => void;
}
