/**
 * Stackra file contract:
 * Purpose: proves a poison message (the provider always refuses) is retried, dead-lettered after
 *          the last attempt, and marked failed on its row (ADR 0148).
 * Boundary: unit tier; the transport is replaced by a class that always throws the retryable
 *           provider refusal; `runJob` from @stackra/queue/testing runs every attempt without
 *           waiting for the backoff. The message comes from the factory.
 * Runtime: node
 * Governing contract: ADR 0148, ADR 0130 (failed job and dead letter), ADR 0022
 */
import { createTestingModule } from "@stackra/container/testing";
import { ProviderUnavailableError } from "@stackra/integrations";
import { MailTransport } from "@stackra/notifications/contracts";
import { runJob } from "@stackra/queue/testing";
import { describe, expect, it } from "@stackra/testing";
import { NotificationsModule } from "#stackra/module";
import { DeliverMessageAction } from "#modules/messages/actions/deliver-message.action";
import { MessageFactory } from "#modules/messages/database/factories/message.factory";
import { MessageStatus } from "#modules/messages/enums/message-status.enum";
import { Message } from "#modules/messages/models/message.model";

/** A transport whose provider is down for good. */
class DownMailTransport extends MailTransport {
  /** Always refuses with the retryable refusal the managed client throws after its retries. */
  async send(): Promise<string> {
    throw ProviderUnavailableError.create({ provider: "resend" });
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
    const message = await MessageFactory.new().create();

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
