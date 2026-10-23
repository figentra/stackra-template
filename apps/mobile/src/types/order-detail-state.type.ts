/**
 * Stackra file contract:
 * Purpose: what the order detail page renders from and calls: the order, its error, the refresh
 *          and the cancel with its permission and pending flags.
 * Boundary: a type only; `useOrderDetail` returns it and the `OrderDetail` page reads it. The order
 *           is the producer's `OrderView`, never re-declared.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decision 14, as amended by programming model v3.1, AGENTS.md: one
 *                     declaration per file), ADR 0139
 */
import type { ClientError } from "@stackra/clients";
import type { OrderView } from "#stackra/clients/commerce";

/** The result of `useOrderDetail`. */
export interface OrderDetailState {
  /** The order; `undefined` only while a cold cache waits for the first answer. */
  readonly order: OrderView | undefined;
  /** The error of the last fetch; `null` otherwise. */
  readonly error: ClientError | null;
  /** Refetches the order. */
  readonly refresh: () => void;
  /** Whether the actor may cancel: awaiting payment, and allowed by permission and policy. */
  readonly canCancel: boolean;
  /** Runs the cancel after the declared confirmation. */
  readonly cancel: () => void;
  /** Whether the cancel is in flight. */
  readonly isCancelling: boolean;
}
