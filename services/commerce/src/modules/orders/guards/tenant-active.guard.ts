/**
 * Stackra file contract:
 * Purpose: refuses every write of a suspended tenant; a pipeline step, not a record rule.
 * Boundary: a guard runs before the policy for every action that lists it (or globally through
 *           ActionsConfig.guards); it sees the context, not the record, and refuses by throwing.
 *           Marked by `extends Guard`, no class decorator (ADR 0264, kind markers).
 * Runtime: node
 * Governing contract: ADR 0098 d3 (pipeline order: actor → validate → tenancy → guards → iam →
 *                     policy → …), guides/programming-model.mdx#policies-and-guards
 */
import { Guard, type GuardContext } from "@stackra/actions";
import { TenantsClient } from "#stackra/clients";
import { TenantSuspendedError } from "#modules/orders/errors/tenant-suspended.error";

/** Applied with `@Action({ guards: [TenantActiveGuard] })` on the order writes. */
export class TenantActiveGuard extends Guard {
  constructor(private readonly tenants: TenantsClient) {}

  /**
   * Reads the tenant through the client, which caches it for a minute.
   * @throws TenantSuspendedError when the tenant is suspended.
   */
  async check(ctx: GuardContext): Promise<void> {
    const tenant = await this.tenants.tenant.get.call({ id: ctx.actor.tenantId });
    if (tenant.suspended) throw new TenantSuspendedError();
  }
}
