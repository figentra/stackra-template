/**
 * Stackra file contract:
 * Purpose: the root module of the loyalty kit: what it shares with a host's modules. The file
 *          exists because `exports` is the one thing gen cannot derive; everything else in
 *          src/node is discovered from its path and base class.
 * Boundary: the key is the package key (`loyalty_kit`), the namespace of every permission, event,
 *           setting, table and i18n key in the kit. No bindings list and no imports: gen discovers
 *           each kind from its group folder, binds the ledger from the driver files and config
 *           `ledger` (or a host `@Replaces(LoyaltyLedger)`), infers edges from constructor types,
 *           and fails the host's build when no LoyaltyMembers driver exists.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 12, 15 and 16, as amended by programming model v3.1,
 *                     AGENTS.md), ADR 0263 (gen writes the wiring)
 */
import { Module } from "@stackra/app";
import { LoyaltyService } from "#core/services/loyalty.service";
import { AccountService } from "#node/services/account.service";
import { LedgerReconcilerService } from "#node/services/ledger-reconciler.service";

/**
 * A host imports it once (by class, never a namespace walk); values come from the host's
 * `src/config/loyalty-kit.config.ts` override.
 *
 * @example
 * ```ts
 * export class CommerceModule extends Module({ imports: [LoyaltyKitModule] }) {}
 * ```
 */
export class LoyaltyKitModule extends Module({
  exports: [LoyaltyService, AccountService, LedgerReconcilerService],
}) {}
