/**
 * Stackra file contract:
 * Purpose: the per-user remembered tenant in the prefs store, read by `TenantProvider.hydrate`.
 * Boundary: one schema class keyed `tenant.remembered`; the prefs store scopes it by user, so a
 *           shared till forgets nothing across users.
 * Runtime: browser
 * Governing contract: ADR 0256, ADR 0208
 */
import { PublicId, Schema, z } from "@stackra/schema";
import { StorageScope } from "@stackra/storage";

/** `undefined` until the user switches once. */
export class RememberedTenant extends Schema(z.object({ tenantId: PublicId("ten").optional() }), {
  key: "tenant.remembered",
  scope: StorageScope.User,
}) {}
