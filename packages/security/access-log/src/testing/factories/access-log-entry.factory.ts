/**
 * Stackra file contract:
 * Purpose: builds AccessLogEntry rows for the purge test and for hosts that seed an audit trail.
 * Boundary: a model factory (MikroORM through @stackra/database/testing); only tests and seeders
 *           import factories.
 * Runtime: node
 * Governing contract: ADR 0190 (factories), ADR 0269
 */
import { Factory, type Faker } from "@stackra/database/testing";
import { DataClassification } from "#core/enums/data-classification.enum";
import { AccessLogEntry } from "#node/models/access-log-entry.model";

/**
 * `new AccessLogEntryFactory(em).createOne({ at })` pins the only field a retention test cares
 * about.
 */
export class AccessLogEntryFactory extends Factory<AccessLogEntry> {
  /** The model this factory builds. */
  model = AccessLogEntry;

  /**
   * A personal read by a staff member of one customer, dated now; the call id is unique per row.
   */
  protected definition(faker: Faker): Partial<AccessLogEntry> {
    return {
      callId: faker.string.uuid(),
      target: "CustomerReads.view",
      classification: DataClassification.Personal,
      actor: { type: "user", id: `usr_${faker.string.alphanumeric(26)}` },
      subjects: [`cus_${faker.string.alphanumeric(26)}`],
      at: new Date(),
    };
  }
}
