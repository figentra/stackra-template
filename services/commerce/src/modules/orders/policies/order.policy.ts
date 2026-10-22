/**
 * Stackra file contract:
 * Purpose: record-level rules for orders. Method names are permission verbs: `cancel` refines
 *          OrderPermissions.cancel.
 * Boundary: a pure decision (allow | deny | abstain); no writes, no network. A method exists only
 *           to refine a permission per record (ADR 0098), so there is no `expire` method. A
 *           `Service` actor is judged as the principal it acts for, and is denied when it acts for
 *           nobody.
 * Runtime: node
 * Governing contract: ADR 0132 d4, ADR 0263 d10 (binding by verb),
 *                     guides/programming-model.mdx#policies-and-guards, ADR 0098
 */
import { Decision, Policy, type PolicyFor } from "@stackra/iam";
import { ActorKind, Realm, type Actor } from "@stackra/contracts";
import { SettingsReader } from "@stackra/settings";
import { Order } from "#modules/orders/models/order.model";
import { OrderPermissions } from "#modules/orders/permissions/order.permission";
import { OrderSettings } from "#modules/orders/settings/order.setting";

/** Decides per order after the permission check passed. `deny` beats a granted permission. */
@Policy(Order)
export class OrderPolicy implements PolicyFor<typeof OrderPermissions, Order> {
  /**
   * @param settings - reads OrderSettings for the actor's tenant, so a change needs no redeploy.
   */
  constructor(private readonly settings: SettingsReader) {}

  /**
   * Staff may cancel any unpaid order; a customer only their own, and only if the tenant allows it.
   * A service (the inbound-mail relay) cancels only as the customer it acts for, under the same
   * customer rules: own orders, unpaid only (the inbound-mail receiver's safeguard c).
   */
  async cancel(actor: Actor, order: Order): Promise<Decision> {
    if (!order.status.canCancel()) return Decision.Deny;
    if (actor.kind === ActorKind.Service && !actor.onBehalfOf) return Decision.Deny;
    const subject = actor.onBehalfOf ?? actor;
    if (subject.realm === Realm.TenantAdmin) return Decision.Abstain;
    const { customersMayCancel } = await this.settings.for(OrderSettings);
    return customersMayCancel && order.customerId === subject.id ? Decision.Allow : Decision.Deny;
  }

  /** A customer reads only their own orders; every other realm is left to the permission. */
  read(actor: Actor, order: Order): Decision {
    const subject = actor.onBehalfOf ?? actor;
    const stranger = subject.realm === Realm.Customer && order.customerId !== subject.id;
    return stranger ? Decision.Deny : Decision.Abstain;
  }
}
