/**
 * Stackra file contract:
 * Purpose: named queries over orders that more than one service or query needs.
 * Boundary: a repository holds reads and no behaviour (lint: no `record`, no `transition`, no
 *           client injection). The default `Repository<Order>` exists without this file; gen wires
 *           this class in its place when it exists.
 * Runtime: node
 * Governing contract: ADR 0130 (amended: `repositories/` allowed for query classes),
 *                     guides/programming-model.mdx#repositories
 */
import { Repository, RepositoryOf } from "@stackra/database";
import { Order } from "#modules/orders/models/order.model";
import { OrderStatus } from "#modules/orders/enums/order-status.enum";

/** Injected as `Repository<Order>` or as `OrderRepository`; both resolve to this class. */
@RepositoryOf(Order)
export class OrderRepository extends Repository<Order> {
  /** Pending orders created before `cutoff`, oldest first, with lines; the expiry job's page. */
  findStale(cutoff: Date, limit: number): Promise<Order[]> {
    return this.find(
      { status: OrderStatus.PendingPayment, createdAt: { $lt: cutoff } },
      { limit, orderBy: { createdAt: "asc" }, populate: ["lines"] },
    );
  }

  /** Paid orders captured since `since`; the revenue-today query's rows. */
  findPaidSince(since: Date): Promise<Order[]> {
    return this.find({ status: OrderStatus.Paid, paidAt: { $gte: since } });
  }
}
