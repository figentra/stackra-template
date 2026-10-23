/**
 * Stackra file contract:
 * Purpose: proves how a record's subjects are resolved: the principal a call is for by default, the
 *          named field of every record among the arguments and the result otherwise, nothing
 *          written when no subject was touched, and a failing sink never reaching the caller.
 * Boundary: unit tier; the service is built by the testing module with the sink replaced by the
 *           package's own fake, so every write is recorded.
 * Runtime: node
 * Governing contract: ADR 0294 (decision 6), ADR 0134, ADR 0022
 */
import { AccessLogConfig, AccessLogService } from "@acme/access-log";
import { AccessLogSink, DataClassification } from "@acme/access-log/contracts";
import { AccessLogModule } from "@acme/access-log/node";
import { FakeAccessLogSink } from "@acme/access-log/testing";
import { createTestingModule } from "@stackra/container/testing";
import { actors } from "@stackra/iam/testing";
import { describe, expect, it } from "@stackra/testing";

/** A service built against the given sink. */
async function serviceWith(sink: FakeAccessLogSink): Promise<AccessLogService> {
  const app = await createTestingModule(AccessLogModule)
    .withConfig(AccessLogConfig, { sink: "memory" })
    .override(AccessLogSink, sink)
    .compile();
  return app.get(AccessLogService);
}

/** Guards whose data an access record names, the one fact an audit question asks about. */
describe(AccessLogService, () => {
  /** A service acting for a customer is logged against that customer, not the service. */
  it("names the principal the call is for when the facet names no field", async () => {
    const sink = FakeAccessLogSink.with();
    const service = await serviceWith(sink);
    const relay = actors.service("notifications", { onBehalfOf: actors.customer("usr_1") });

    await service.record(
      "call_1",
      relay,
      "Reads.view",
      { classification: DataClassification.Personal },
      [],
    );

    expect(sink.calls("write").map((record) => record.subjects)).toEqual([["usr_1"]]);
  });

  /** The field is read from records among the arguments and from an array result, once each. */
  it("names the field of every record the call handled, or writes nothing", async () => {
    const sink = FakeAccessLogSink.with();
    const service = await serviceWith(sink);
    const options = {
      classification: DataClassification.Pseudonymous,
      subjects: "customerId",
    } as const;

    await service.record("call_1", actors.staff(), "Orders.find", options, [
      "ord_1",
      [{ customerId: "usr_1" }, { customerId: "usr_2" }, { customerId: "usr_1" }],
    ]);
    await service.record("call_2", actors.staff(), "Orders.attach", options, ["ord_1", "pay_1"]);

    expect(sink.calls("write").map((record) => record.subjects)).toEqual([["usr_1", "usr_2"]]);
  });

  /** A sink outage is reported through the logger; the call it audits still succeeds. */
  it("swallows a sink failure", async () => {
    const service = await serviceWith(FakeAccessLogSink.with({ failing: true }));

    await expect(
      service.record(
        "call_1",
        actors.staff(),
        "Reads.view",
        { classification: DataClassification.Health },
        [],
      ),
    ).resolves.toBeUndefined();
  });
});
