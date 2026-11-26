/**
 * Stackra file contract:
 * Purpose: unit tests of the compliance wiring gen writes for this service: the `HoldRegistry`, `SubjectHolds` and
 *          `SubjectSaltStore` are privacy's Postgres drivers, no `AuditTrail` is bound yet, and the retention, outbox,
 *          access-log and export purge jobs are registered on their schedules. Each binding is silent when missing
 *          (`boot` connects no registry), so this test is what notices a deleted driver file or a dropped dependency.
 * Boundary: test only; reads the generated wiring and the scheduled-job registry the generated registrations fill,
 *           never a container or a database. What the drivers do on Postgres is `note-privacy.int.test.ts`.
 * Runtime: node (vitest)
 * Governing contract: ADR 0022 (test placement); ADR 0263 (gen writes the wiring); ADR 0294 (decisions 15 and 16:
 *                     `@Replaces`); ADR 0212 (decision 1: the write audit); ADR 0134 (decisions 3 and 4); ADR 0189.
 */
import { AuditTrail } from "@stackra/actions/contracts";
import { HoldRegistry } from "@stackra/database/contracts";
import { SubjectHolds, SubjectSaltStore } from "@stackra/privacy/contracts";
import {
  PostgresHoldRegistryDriver as PrivacyHoldRegistryDriver,
  PostgresSubjectHoldsDriver as PrivacySubjectHoldsDriver,
  PostgresSubjectSaltStoreDriver as PrivacySubjectSaltStoreDriver,
} from "@stackra/privacy/node";
import { encoreCronJobs } from "@stackra/scheduler";
import { describe, expect, it } from "@stackra/testing";

import { PostgresHoldRegistryDriver } from "#modules/compliance/drivers/postgres-hold-registry.driver";
import { PostgresSubjectHoldsDriver } from "#modules/compliance/drivers/postgres-subject-holds.driver";
import { PostgresSubjectSaltStoreDriver } from "#modules/compliance/drivers/postgres-subject-salt-store.driver";
import { wiring } from "#stackra/wiring";

/** The class the generated wiring binds in place of `port`, if any. */
function overrideOf(port: unknown): unknown {
  return wiring.replaces.find((replacement) => replacement.provide === port)?.override;
}

/** The compliance bindings and jobs of the service. */
describe("the generated compliance wiring", () => {
  /** Each port the service binds itself, the class it binds and the package driver that class is. */
  it.each([
    ["HoldRegistry", HoldRegistry, PostgresHoldRegistryDriver, PrivacyHoldRegistryDriver],
    ["SubjectHolds", SubjectHolds, PostgresSubjectHoldsDriver, PrivacySubjectHoldsDriver],
    [
      "SubjectSaltStore",
      SubjectSaltStore,
      PostgresSubjectSaltStoreDriver,
      PrivacySubjectSaltStoreDriver,
    ],
  ] as const)("binds %s to the package's Postgres driver", (_name, port, driver, packaged) => {
    expect(overrideOf(port)).toBe(driver);
    expect(driver.prototype).toBeInstanceOf(packaged);
  });

  /**
   * The pipeline awaits the trail inside the call's unit of work, and `@stackra/access-log` 0.33.0 throws on every
   * Postgres append (STA-1583, core), so binding it would roll back every note write. The binding comes with the
   * catalog bump to the access-log release that carries the fix; that change flips this case.
   */
  it("binds no AuditTrail until the pinned access-log appends on Postgres", () => {
    expect(overrideOf(AuditTrail)).toBeUndefined();
  });

  /** The nightly upkeep that enforces retention and cleans what the privacy flows leave behind. */
  it("schedules the retention, outbox, access-log and export purge jobs", () => {
    const schedules = new Map(encoreCronJobs().map((job) => [job.key, job.schedule]));
    expect(schedules.get("data_maintenance.record.prune@1")).toBe("0 3 * * *");
    expect(schedules.get("data_maintenance.outbox_message.prune@1")).toBeDefined();
    expect(schedules.get("access_log.access_log_entry.purge@1")).toBeDefined();
    expect(schedules.get("privacy.subject_export.purge@1")).toBe("0 4 * * *");
  });
});
