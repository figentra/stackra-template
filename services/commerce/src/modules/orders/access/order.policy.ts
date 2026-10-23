/**
 * Stackra file contract:
 * Purpose: record rules for orders. Each method is named after a verb of OrderPermissions and
 *          refines that permission for one order.
 * Boundary: a pure decision (allow, deny or abstain); no writes, no network. It runs inside
 *           `handle` through `ctx.authorize(order)`, after the permission step passed, so a method
 *           exists only where a verb needs a record rule: there is no `create` or `expire` method.
 *           A Service actor is judged as the principal it acts for, and is denied when it acts for
 *           nobody.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 16 and 23), ADR 0132 d4, ADR 0138 (as amended), ADR 0098
 */
import { type Actor, ActorKind, Realm } from "@stackra/contracts";
import { Decision, Policy } from "@stackra/iam";
import type { SettingsReader } from "@stackra/settings";
import { OrderPermissions } from "#modules/orders/access/order.permissions";
import type { Order } from "#modules/orders/models/order.model";
import type { OrderStateMachine } from "#modules/orders/models/order.state-machine";
import { OrdersSettings } from "#modules/orders/orders.settings";

/** `deny` beats a granted permission; `abstain` leaves the permission as the whole answer. */
export class OrderPolicy extends Policy(OrderPermissions) {
  /**
   * @param settings - reads OrdersSettings for the actor's tenant, so a change needs no redeploy.
   * @param lifecycle - answers whether a cancel is allowed from the order's current state.
   */
  constructor(
    private readonly settings: SettingsReader,
    private readonly lifecycle: OrderStateMachine,
  ) {
    super();
  }

  /**
   * Staff may cancel any unpaid order; a customer only their own, and only while the tenant allows
   * it. A service (the inbound-mail relay) cancels only as the customer it acts for, under the
   * same customer rules.
   */
  async cancel(actor: Actor, order: Order): Promise<Decision> {
    if (!this.lifecycle.can(order, "cancel")) return Decision.Deny;
    if (actor.kind === ActorKind.Service && !actor.onBehalfOf) return Decision.Deny;
    const subject = actor.onBehalfOf ?? actor;
    if (subject.realm === Realm.Tenant) return Decision.Abstain;
    const { customersMayCancel } = await this.settings.for(OrdersSettings);
    return customersMayCancel && order.customerId === subject.id ? Decision.Allow : Decision.Deny;
  }

  /** A customer reads only their own orders; every other realm is left to the permission. */
  read(actor: Actor, order: Order): Decision {
    const subject = actor.onBehalfOf ?? actor;
    const stranger = subject.realm === Realm.Customer && order.customerId !== subject.id;
    return stranger ? Decision.Deny : Decision.Abstain;
  }
}
