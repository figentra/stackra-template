/**
 * Stackra file contract:
 * Purpose: proves the purge keeps records inside the retention window and deletes the older ones.
 * Boundary: unit tier through the real pipeline (`run` from @stackra/actions/testing) on memory
 *           drivers; the clock is frozen and the window is set by config, so the cutoff is exact.
 *           Records come from the package's factory through its ./testing entry.
 * Runtime: node
 * Governing contract: ADR 0098 (one pipeline), ADR 0022, ADR 0007 (amended: test docblocks)
 */
import { AccessLogConfig } from "@acme/access-log";
import { AccessLogModule } from "@acme/access-log/node";
import { AccessLogEntryFactory } from "@acme/access-log/testing";
import { run } from "@stackra/actions/testing";
import { createTestingModule } from "@stackra/container/testing";
import { actors } from "@stackra/iam/testing";
import { describe, expect, freezeClock, it } from "@stackra/testing";
import { PurgeAccessLogAction } from "#node/actions/purge-access-log.action";

/**
 * Guards retention: a purge that deletes too much destroys the audit trail, too little breaks the
 * legal window.
 */
describe(PurgeAccessLogAction, () => {
  /**
   * With a 90-day window, an entry 100 days old goes and one 10 days old stays; the frozen clock
   * fixes "now".
   */
  it("deletes only records older than retentionDays", async () => {
    freezeClock("2026-10-21T00:00:00Z");
    await createTestingModule(AccessLogModule)
      .useDrivers("memory")
      .withConfig(AccessLogConfig, { sink: "memory", retentionDays: 90 })
      .compile();
    await AccessLogEntryFactory.new().create({ at: new Date("2026-07-13T00:00:00Z") });
    await AccessLogEntryFactory.new().create({ at: new Date("2026-10-11T00:00:00Z") });

    const result = await run(PurgeAccessLogAction, {}, { as: actors.system() });

    expect(result.output).toEqual({ deleted: 1 });
  });
});
