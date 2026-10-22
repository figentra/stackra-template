/**
 * Stackra file contract:
 * Purpose: the conformance test: what the Explorer wraps at bootstrap is exactly what gen discovers
 *          at build time, and a wrapped call writes one record with the actor and the subject ids.
 * Boundary: unit tier; a fixture module with one decorated class; memory sink by config;
 *           `discoverWithGen` from @stackra/gen/testing takes the decorator itself as the key.
 * Runtime: node
 * Governing contract: ADR 0144 (conformance), ADR 0022, ADR 0007 (amended: test docblocks)
 */
import { describe, expect, it } from "@stackra/testing";
import { createTestingModule } from "@stackra/container/testing";
import { actors } from "@stackra/iam/testing";
import { discoverWithGen } from "@stackra/gen/testing";
import { Module } from "@stackra/container";
import { AccessLogSink, DataClassification } from "@acme/access-log/contracts";
import { AccessLogConfig, AccessLogged } from "@acme/access-log";
import { AccessLogExplorer, AccessLogModule } from "@acme/access-log/node";

/** The smallest host: one provider with one logged read. */
class CustomerReads {
  @AccessLogged({ classification: DataClassification.Personal, subjects: (id: string) => [id] })
  async view(id: string): Promise<{ id: string }> {
    return { id };
  }
}
@Module({ key: "fixture", exports: [CustomerReads] })
class FixtureModule {}

/** Guards the access-log wiring, since an unlogged read is a silent audit gap. */
describe(AccessLogExplorer, () => {
  /**
   * If the two lists ever differ, a method is logged at run time that the manifest does not know,
   * or the reverse.
   */
  it("wraps what gen discovers and records each call", async () => {
    const app = await createTestingModule({ imports: [AccessLogModule, FixtureModule] })
      .withConfig(AccessLogConfig, { sink: "memory" })
      .as(actors.staff("usr_staff"))
      .compile();

    expect(app.get(AccessLogExplorer).targets()).toEqual(
      (await discoverWithGen(FixtureModule, AccessLogged)).map((m) => m.target),
    );

    await app.get(CustomerReads).view("cus_1");
    await expect(app.get(AccessLogSink)).toHaveLoggedAccess({
      target: "CustomerReads.view",
      subjects: ["cus_1"],
      actorId: "usr_staff",
    });
  });
});
