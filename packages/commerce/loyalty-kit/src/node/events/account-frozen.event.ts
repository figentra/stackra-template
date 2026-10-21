/**
 * Stackra file contract:
 * Purpose: an account was frozen or unfrozen by staff. Public, as `loyalty_kit.account.frozen.v1`.
 * Boundary: one class; recorded by AccountService.setFrozen only when the flag changed.
 * Runtime: isomorphic
 * Governing contract: ADR 0141
 */
import { Event, IntegrationEvent, z } from "@stackra/events";

/** `isFrozen` carries the new state, so one event serves both directions. */
@Event({ name: "account.frozen", public: true })
export class AccountFrozen extends IntegrationEvent(
  z.object({ accountId: z.string(), memberId: z.string(), isFrozen: z.boolean() }),
) {}
