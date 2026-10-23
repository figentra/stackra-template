/**
 * Stackra file contract:
 * Purpose: `ActiveTenantState`: what `useActiveTenant` returns to the tenant switcher; the same
 *          shape as the mobile app's.
 * Boundary: a type only, in the app's `types/` group; memberships are the tenancy package's.
 * Runtime: browser
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md: one declaration
 *                     per file), ADR 0208
 */
import type { TenantMembership } from "@stackra/tenancy/react";
import type { I18nKey } from "#stackra/i18n";

/** The active membership, every membership and the guarded switch. */
export interface ActiveTenantState {
  /** The active membership, or `null` for a user with none. */
  readonly current: TenantMembership | null;
  /** Every membership of the signed-in user, in the order the session lists them. */
  readonly memberships: readonly TenantMembership[];
  /** `true` on success, or the refusal's i18n key when queued mutations would be stranded. */
  readonly switchTo: (tenantId: string) => Promise<true | I18nKey>;
}
