/**
 * Stackra file contract:
 * Purpose: the first table of the messages module, `messages.messages`, with every column and
 *          `@Index` the model declared at the time.
 * Boundary: written by `stackra db diff` from `messages.message`, reviewed, then committed and
 *           never edited. It changes only the module's own Postgres schema (`messages`); the table
 *           constants carry the qualified name, and gen creates the schema before the module's
 *           first migration. The recipient is a principal's public id in `varchar(30)`, never an
 *           address. Forward only: there is no `down()`.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13, 20 and 27), ADR 0159 (as amended), ADR 0231
 *                     (index and key names), ADR 0134
 */
import { type Blueprint, Migration } from "@stackra/database";
import { Messages } from "#stackra/tables";
import { MessageStatus } from "#modules/messages/enums/message-status.enum";

/** The dedup row of every queued call; the body is never a column. */
export class CreateMessagesMigration extends Migration {
  /** Creates the table with the command-key dedup index. */
  up(schema: Blueprint): void {
    schema.create(Messages, (t) => {
      t.publicId("msg");
      t.tenant();
      t.timestamps();
      t.string(Messages.columns.commandKey, 128);
      t.string(Messages.columns.principalId, 30); // PublicId<"usr">
      t.string(Messages.columns.mail, 64);
      t.string(Messages.columns.subject, 200);
      t.enum(Messages.columns.status, MessageStatus); // text with ck_messages_status
      t.string(Messages.columns.providerId, 128).nullable();
      t.timestamp(Messages.columns.sentAt).nullable();
      // idx_messages_tenant_id_command_key
      t.unique([Messages.columns.tenantId, Messages.columns.commandKey]);
    });
  }
}
