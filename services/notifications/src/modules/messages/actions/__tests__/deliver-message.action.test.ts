/**
 * Stackra file contract:
 * Purpose: proves a poison message (the provider always refuses) is retried, dead-lettered after
 *          the last attempt, and marked failed on its row (ADR 0148).
 * Boundary: unit tier; the transport is replaced by a class that always throws the retryable
 *           provider error; `runJob` from @stackra/queue/testing runs every attempt without waiting
 *           for the backoff.
 * Runtime: node
 * Governing contract: ADR 0148, ADR 0022, ADR 0130 (failed job + dead letter)
 */
import { describe, expect, it } from "@stackra/testing";
import { createTestingModule } from "@stackra/container/testing";
import { runJob } from "@stackra/queue/testing";
import { NotificationsModule } from "#src/notifications.module";
import { MailTransport } from "#modules/messages/contracts/mail-transport.port";
import { DeliverMessageAction } from "#modules/messages/actions/deliver-message.action";
import { MailProviderUnavailableError } from "#modules/messages/errors/mail-provider-unavailable.error";
import { Message } from "#modules/messages/models/message.model";
import { MessageStatus } from "#modules/messages/enums/message-status.enum";
import { MessageFactory } from "#modules/messages/factories/message.factory";

/** A transport whose provider is down for good. */
class DownMailTransport extends MailTransport {
  /** Always refuses with the retryable provider error. */
  async send(): Promise<string> {
    throw new MailProviderUnavailableError();
  }
}

/** Guards the dead-letter path: a message that can never send must stop retrying and be visible. */
describe(DeliverMessageAction, () => {
  /** Five retries after the first attempt, then the dead-letter queue and a `failed` row. */
  it("dead-letters a poison message after its retries and marks it failed", async () => {
    const app = await createTestingModule(NotificationsModule)
      .useDrivers("memory")
      .override(MailTransport, new DownMailTransport())
      .compile();
    const message = await new MessageFactory(app.em).createOne();

    const job = await runJob(DeliverMessageAction, {
      messageId: message.id,
      html: "<p>x</p>",
      text: "x",
    });

    expect(job).toDeadLetter({ attempts: 6 });
    const saved = await app.repository(Message).findOneOrFail({ id: message.id });
    expect(saved.status).toBe(MessageStatus.Failed);
  });
});
