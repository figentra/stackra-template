/**
 * Stackra file contract:
 * Purpose: proves a redelivered command opens one message, returns the same id, and leads to one
 *          delivery; the memory transport keeps the same contract the resend driver does.
 * Boundary: unit tier through the pipeline; identity faked; memory drivers (the config default
 *           binds the memory transport); the delivery job runs when the memory queue is drained.
 * Runtime: node
 * Governing contract: ADR 0136 (idempotency step), 0260 d4, ADR 0022,
 *                     guides/programming-model.mdx#tests
 */
import { describe, expect, it } from "@stackra/testing";
import { actors } from "@stackra/iam/testing";
import { createTestingModule } from "@stackra/container/testing";
import { run } from "@stackra/actions/testing";
import { IdentityResolver } from "@stackra/contracts";
import { fakeIdentity } from "@stackra/identity/testing";
import { drainQueue } from "@stackra/queue/testing";
import { NotificationsModule } from "#src/notifications.module";
import { MailTransport } from "#modules/messages/contracts/mail-transport.port";
import { MemoryMailTransport } from "#modules/messages/drivers/memory-mail-transport.driver";
import { SendMessageAction } from "#modules/messages/actions/send-message.action";
import { MessageSent } from "#modules/messages/events/message-sent.event";

/** Guards message sending, where a retry must not email a customer twice. */
describe(SendMessageAction, () => {
  /** Same key twice: one row, one delivery job, one transport call, one event, the same output. */
  it("sends once per idempotency key and records once", async () => {
    const customer = actors.customer();
    const app = await createTestingModule(NotificationsModule)
      .useDrivers("memory")
      .override(
        IdentityResolver,
        fakeIdentity({ [customer.id]: { email: "a@example.test", locale: "ar" } }),
      )
      .compile();
    const input = {
      mail: "order_receipt",
      to: { principalId: customer.id },
      subject: "Receipt",
      html: "<p>شكراً</p>",
      text: "شكراً",
    };
    const as = actors.service("commerce");

    const first = await run(SendMessageAction, input, { as, idempotencyKey: "k1" });
    const second = await run(SendMessageAction, input, { as, idempotencyKey: "k1" });
    await drainQueue(); // runs DeliverMessageAction

    expect(second.output).toEqual(first.output);
    expect(app.events.published().ofType(MessageSent)).toHaveLength(1);
    const transport = app.get(MailTransport) as MemoryMailTransport;
    expect(transport.sent()).toHaveLength(1);
    expect(transport.sent()[0]?.html).toContain("شكراً");
  });
});
