/**
 * Stackra file contract:
 * Purpose: `PostgresHoldRegistryDriver`, this service's `HoldRegistry`: legal holds live in `privacy.legal_holds`,
 *          partitioned per tenant, and every disposal (the retention prune, a data-subject erasure, a delete through
 *          the ORM) asks it first, so a held note, or a note whose author is held, is kept and the refusal is logged in
 *          `privacy.legal_hold_refusals`.
 * Boundary: the `postgres` driver of `@stackra/privacy` for a product outside Figentra OS, bound by
 *           `@Replaces(HoldRegistry)` because two packages offer a driver and no config field selects one; it adds
 *           nothing. Gen's boot connects the bound registry (`connectHoldRegistry`). Inside Figentra OS a host removes
 *           this file and binds `ServiceHoldRegistryDriver` over the compliance service instead.
 * Runtime: node
 * Governing contract: ADR 0134 (decision 4 and its 2026-10-24 amendment: every disposal path asks the registry); ADR
 *                     0189 (decision 4); ADR 0294 (decisions 15 and 16: `@Replaces`); ADR 0263.
 */
import { Replaces } from "@stackra/container";
import { HoldRegistry } from "@stackra/database/contracts";
import { PostgresHoldRegistryDriver as PrivacyHoldRegistryDriver } from "@stackra/privacy/node";

/** The service's legal holds, stored per tenant in Postgres. */
@Replaces(HoldRegistry)
export class PostgresHoldRegistryDriver extends PrivacyHoldRegistryDriver {}
