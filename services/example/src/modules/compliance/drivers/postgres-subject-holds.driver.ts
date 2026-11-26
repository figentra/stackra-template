/**
 * Stackra file contract:
 * Purpose: `PostgresSubjectHoldsDriver`, this service's `SubjectHolds`: whether a legal hold covers a subject, read
 *          from `privacy.legal_holds` in the running tenant, so an account deletion defers while the person is held.
 * Boundary: the `postgres` driver of `@stackra/privacy`, bound by `@Replaces(SubjectHolds)` beside
 *           `PostgresHoldRegistryDriver`, so both read the same holds; it adds nothing. A host inside Figentra OS
 *           removes it with the registry.
 * Runtime: node
 * Governing contract: ADR 0134 (decision 4); ADR 0189 (decision 2); STA-1567; ADR 0294 (decisions 15 and 16:
 *                     `@Replaces`); ADR 0263.
 */
import { Replaces } from "@stackra/container";
import { SubjectHolds } from "@stackra/privacy/contracts";
import { PostgresSubjectHoldsDriver as PrivacySubjectHoldsDriver } from "@stackra/privacy/node";

/** Whether a subject is held, read per tenant from Postgres. */
@Replaces(SubjectHolds)
export class PostgresSubjectHoldsDriver extends PrivacySubjectHoldsDriver {}
