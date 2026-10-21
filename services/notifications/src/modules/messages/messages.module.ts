/**
 * Stackra file contract:
 * Purpose: the messages module: one outbound message per command, delivered by a retried job
 *          through a port; the in-app inbox; notification preferences; the inbound-mail receiver.
 * Boundary: exports nothing; the service has one module. The transport driver is selected by this
 *           module's own port and the service config, not by a package. Mail templates belong to
 *           the producing service (ADR 0223); this module owns delivery, preferences and the log.
 * Runtime: node
 * Governing contract: ADR 0263, guides/programming-model.mdx#modules, ADR 0223
 */
import { Module } from "@stackra/container";

/** `messages` is the namespace of every key in this folder (`messages.message.send`, …). */
@Module({ key: "messages" })
export class MessagesModule {}
