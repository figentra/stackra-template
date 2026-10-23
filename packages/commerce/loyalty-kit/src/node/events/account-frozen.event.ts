/**
 * Stackra file contract:
 * Purpose: an account was frozen or unfrozen by staff. Leaves through the host's outbox as
 *          `loyalty_kit.account.frozen.v1`.
 * Boundary: an integration event recorded by AccountService#setFrozen only when the flag changed.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 5, 16 and 20), ADR 0141
 */
import type { PublicId } from "@stackra/contracts";
import { IntegrationEvent } from "@stackra/events";

/** `isFrozen` carries the new state, so one event serves both directions. */
export class AccountFrozen extends IntegrationEvent({ name: "account.frozen" }) {
  /** The account whose flag changed. */
  accountId!: PublicId<"lac">;

  /** The principal it belongs to. */
  memberId!: string;

  /** The flag after the change. */
  isFrozen!: boolean;
}
