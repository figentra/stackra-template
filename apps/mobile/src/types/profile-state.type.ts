/**
 * Stackra file contract:
 * Purpose: what the profile page reads and calls: the signed-in user, the active and every
 *          membership, and the tenant switch.
 * Boundary: a type only; `useProfile` returns it and the `Profile` page reads it.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decision 14, as amended by programming model v3.1, AGENTS.md: one
 *                     declaration per file), ADR 0206, ADR 0208
 */
import type { SignedInSession } from "@stackra/identity/react";
import type { TenantMembership } from "@stackra/tenancy/react";
import type { I18nKey } from "#stackra/i18n";

/** The result of `useProfile`. */
export interface ProfileState {
  /** The signed-in user. */
  readonly user: SignedInSession["user"];
  /** The active membership, or `null` for a user with none. */
  readonly current: TenantMembership | null;
  /** Every tenant the user belongs to, the active one included. */
  readonly memberships: readonly TenantMembership[];
  /** `true` on success, or the refusal's key when queued writes would be stranded. */
  readonly switchTo: (tenantId: string) => Promise<true | I18nKey>;
}
