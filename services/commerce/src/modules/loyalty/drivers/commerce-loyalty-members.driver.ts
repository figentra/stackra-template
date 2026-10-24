/**
 * Stackra file contract:
 * Purpose: commerce's driver for the kit's LoyaltyMembers port: a customer with a paid order is a
 *          member.
 * Boundary: the package declares the port; this class implements it and is named by its file prefix
 *           (`commerce`). It is the port's only candidate, so no config field selects it and no
 *           host config overrides it (ADR 0263). The package never imports this file; gen writes
 *           the binding.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13, 16 and 17), ADR 0260 d7 (package port, service
 *                     driver), ADR 0263
 */
import { LoyaltyMembers, type MemberId } from "@acme/loyalty-kit/contracts";
import { Driver } from "@stackra/container";
import type { PublicId } from "@stackra/contracts";
import { OrderStatus } from "#modules/orders/enums/order-status.enum";
import type { OrderService } from "#modules/orders/services/order.service";

/** Injected into the kit wherever it asks for LoyaltyMembers, without the kit knowing commerce. */
export class CommerceLoyaltyMembersDriver extends Driver(LoyaltyMembers) {
  /**
   * @param orders - counts the principal's paid orders.
   */
  constructor(private readonly orders: OrderService) {
    super();
  }

  /**
   * Membership is earned by a paid order. The earn listener runs after `order.paid`, when that
   * order is already paid, so the first paid order counts and earns.
   */
  async isMember(member: MemberId): Promise<boolean> {
    // `memberId()` brands the principal's public id, so the string is the customer's `usr_` id
    const customerId = member as string as PublicId<"usr">;
    return (await this.orders.count({ customerId, status: OrderStatus.Paid })) > 0;
  }
}
