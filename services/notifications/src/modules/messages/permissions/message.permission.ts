/**
 * Stackra file contract:
 * Purpose: the permissions of the `message` resource; names are `messages.message.<member>`.
 * Boundary: `service` actors hold `send` through the service role; customers never send.
 * Runtime: isomorphic
 * Governing contract: ADR 0132, guides/programming-model.mdx#permissions
 */
import { Permission, Permissions, Risk } from "@stackra/iam";
import { Message } from "#modules/messages/models/message.model";

/** Permissions of the `message` resource, named `messages.message.<member>`. */
@Permissions(Message)
export class MessagePermissions {
  /** Queue a message to a principal. */
  @Permission({ risk: Risk.L1 }) static readonly send: Permission;
  /** Read sent messages in the console. */
  @Permission({ risk: Risk.L0 }) static readonly read: Permission;
}
