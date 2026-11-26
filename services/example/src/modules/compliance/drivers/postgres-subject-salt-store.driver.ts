/**
 * Stackra file contract:
 * Purpose: `PostgresSubjectSaltStoreDriver`, this service's `SubjectSaltStore`: the per-subject salts subject keys are
 *          derived from live in `privacy.subject_salts`, partitioned per tenant, so an erasure destroys the subject's
 *          salt in the running tenant and every field sealed under that subject's key becomes unreadable.
 * Boundary: the `postgres` driver of `@stackra/privacy`, bound by `@Replaces(SubjectSaltStore)` because no config field
 *           selects the port's driver; it adds nothing. A host with its own key service removes this file and binds
 *           that service's driver the same way. Deleting a salt does not reach backups; ADR 0188 decision 3 caps how
 *           long they live.
 * Runtime: node
 * Governing contract: ADR 0189 (decision 2: crypto-shredding); ADR 0294 (decisions 15 and 16: `@Replaces`); ADR 0263.
 */
import { Replaces } from "@stackra/container";
import { SubjectSaltStore } from "@stackra/privacy/contracts";
import { PostgresSubjectSaltStoreDriver as PrivacySubjectSaltStoreDriver } from "@stackra/privacy/node";

/** The service's subject salts, stored per tenant in Postgres. */
@Replaces(SubjectSaltStore)
export class PostgresSubjectSaltStoreDriver extends PrivacySubjectSaltStoreDriver {}
