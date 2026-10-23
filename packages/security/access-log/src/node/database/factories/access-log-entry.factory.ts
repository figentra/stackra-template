/**
 * Stackra file contract:
 * Purpose: builds AccessLogEntry rows for the purge test and for hosts that seed an audit trail.
 * Boundary: bound to AccessLogEntry by the base factory's argument; a named state is a method.
 *           Faker comes from @stackra/database/testing, and the generated ./testing entry is the
 *           only one that exports a factory, so Faker never reaches a runtime entry.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 11, 13 and 15), ADR 0190 (factories), ADR 0269
 */
import { Factory, type Faker } from "@stackra/database/testing";
import type { Attributes } from "@stackra/model";
import { DataClassification } from "#contracts/enums/data-classification.enum";
import { AccessLogEntry } from "#node/models/access-log-entry.model";

/**
 * A personal read of one customer by a staff member, dated now; the call id is unique per row.
 *
 * @example
 * await AccessLogEntryFactory.new().create({ at: new Date("2026-07-13T00:00:00Z") });
 */
export class AccessLogEntryFactory extends Factory(AccessLogEntry) {
  /** The default attributes of one record; a retention test overrides `at`. */
  definition(faker: Faker): Attributes<AccessLogEntry> {
    return {
      callId: faker.string.uuid(),
      target: "CustomerReads.view",
      classification: DataClassification.Personal,
      actor: { type: "user", id: faker.publicId("usr") },
      subjects: [faker.publicId("cus")],
      at: new Date(),
    };
  }
}
