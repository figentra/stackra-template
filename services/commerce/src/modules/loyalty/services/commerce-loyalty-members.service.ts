/**
 * Stackra file contract:
 * Purpose: commerce's driver for the kit's LoyaltyMembers port: a customer with a paid order is a
 *          member.
 * Boundary: the package declares the port as an abstract class; this class registers itself as the
 *           `commerce` driver. It is the port's only candidate, so it needs no `@DriverOf` field
 *           and no host config (ADR 0263). The package never imports this file; gen writes the
 *           binding.
 * Runtime: node
 * Governing contract: ADR 0260 d7 (package port, service driver), ADR 0263
 */
import { Driver } from "@stackra/container";
import { LoyaltyMembers, type MemberId } from "@acme/loyalty-kit/contracts";
import { OrderService } from "#modules/orders/services/order.service";
import { OrderStatus } from "#modules/orders/enums/order-status.enum";

/**
 * Injected into the kit wherever it asks for `LoyaltyMembers`, without the kit knowing commerce.
 */
@Driver(LoyaltyMembers, "commerce")
export class CommerceLoyaltyMembers extends LoyaltyMembers {
  constructor(private readonly orders: OrderService) {
    super();
  }

  /**
   * Membership is earned by a paid order. The earn listener runs after `order.paid`, when that
   * order is already Paid, so the first paid order counts and earns .
   */
  async isMember(member: MemberId): Promise<boolean> {
    return (await this.orders.count({ customerId: member, status: OrderStatus.Paid })) > 0;
  }
}
