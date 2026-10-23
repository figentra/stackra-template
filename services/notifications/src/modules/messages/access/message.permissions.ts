/**
 * Stackra file contract:
 * Purpose: the permissions of the message model: `messages.message.<verb>`, each with its risk.
 * Boundary: statics only; the value is the risk and nothing else. Names are derived from the
 *           module, the class (minus `Permissions`) and the static. Service actors hold `send`
 *           through the service role; customers never send. Labels are the derived i18n keys
 *           `messages::permissions.message.<verb>`.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 16 and 20), ADR 0132, ADR 0208 (names), ADR 0099 (risk)
 */
import { Permission, Permissions } from "@stackra/iam";

/** `send` is also the permission of the delivery job, whose key names no permission verb. */
export class MessagePermissions extends Permissions {
  /** Queue a message to a principal. */
  static readonly send = Permission.L1;

  /** Read sent messages in the console. */
  static readonly read = Permission.L0;
}
