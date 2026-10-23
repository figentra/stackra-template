/**
 * Stackra file contract:
 * Purpose: the conformance test: what the Explorer wraps at bootstrap is exactly what gen discovers
 *          at build time, and a wrapped call writes one record with the actor and the subject ids.
 * Boundary: unit tier; a fixture module with one logged service; memory sink by config;
 *           `discoverWithGen` from @stackra/gen/testing takes the decorator itself as the key.
 * Runtime: node
 * Governing contract: ADR 0144 (conformance), ADR 0294 (decision 6), ADR 0022
 */
import { AccessLogConfig, AccessLogged } from "@acme/access-log";
import { AccessLogSink, DataClassification } from "@acme/access-log/contracts";
import { AccessLogExplorer, AccessLogModule } from "@acme/access-log/node";
import "@acme/access-log/testing"; // registers toHaveLoggedAccess
import { Module, Service } from "@stackra/app";
import { createTestingModule } from "@stackra/container/testing";
import { discoverWithGen } from "@stackra/gen/testing";
import { actors } from "@stackra/iam/testing";
import { describe, expect, it } from "@stackra/testing";

/** The smallest host: one service whose reads return customer records. */
@AccessLogged({
  classification: DataClassification.Personal,
  subjects: "id",
})
class CustomerReads extends Service {
  /** Returns the customer record; its `id` is the logged subject. */
  async view(id: string): Promise<{ id: string }> {
    return { id };
  }
}

/** Shares the logged service, so the testing module builds it. */
class FixtureModule extends Module({ exports: [CustomerReads] }) {}

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
      (await discoverWithGen(FixtureModule, AccessLogged)).map((found) => found.target),
    );

    await app.get(CustomerReads).view("cus_1");
    await expect(app.get(AccessLogSink)).toHaveLoggedAccess({
      target: "CustomerReads.view",
      subjects: ["cus_1"],
      actorId: "usr_staff",
    });
  });
});
