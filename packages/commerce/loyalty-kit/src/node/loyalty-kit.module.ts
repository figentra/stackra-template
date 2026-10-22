/**
 * Stackra file contract:
 * Purpose: the kit's module manifest: what it shares with a host's modules. Everything else is
 *          discovered.
 * Boundary: no providers, no imports, no forRoot. Gen discovers every decorated class in this
 *           entry's kind folders, binds the ledger from `@Driver` registrations and the `@DriverOf`
 *           config field (or a host `@Replaces`), infers edges from constructor types, and fails
 *           when no host `@Driver(LoyaltyMembers, …)` exists. `key` is the namespace of every
 *           permission, event, i18n and settings key in the module; gen fails only on a duplicate
 *           or malformed key.
 * Runtime: node
 * Governing contract: ADR 0263 (gen writes the wiring)
 */
import { Module } from "@stackra/container";
import { LoyaltyService } from "#core/services/loyalty.service";
import { AccountService } from "#node/services/account.service";
import { LedgerReconcilerService } from "#node/services/ledger-reconciler.service";

/**
 * Import once in a host's root module; values come from the host's
 * `src/config/loyalty-kit.config.ts` override.
 *
 * @example
 * @Module({ imports: [LoyaltyKitModule] })
 * export class CommerceModule {}
 */
@Module({
  key: "loyalty_kit",
  exports: [LoyaltyService, AccountService, LedgerReconcilerService],
})
export class LoyaltyKitModule {}
