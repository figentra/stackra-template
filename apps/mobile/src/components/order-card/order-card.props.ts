/**
 * Stackra file contract:
 * Purpose: the props of one order card: the order as the orders queries return it and the press
 *          handler.
 * Boundary: a type only, beside the component it types; re-exported by the folder's `index.ts`.
 *           The order is the producer's `OrderView` from the generated client, never re-declared.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decision 14, as amended by programming model v3.1, AGENTS.md: Props
 *                     in their own file)
 */
import type { OrderView } from "#stackra/clients/commerce";

/** Props of `OrderCard`. */
export interface OrderCardProps {
  /** The order as `ListOrdersQuery` and `GetOrderQuery` return it. */
  readonly order: OrderView;
  /** Opens the detail; receives the public id. */
  readonly onPress: (orderId: string) => void;
}
