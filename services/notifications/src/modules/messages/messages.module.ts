/**
 * Stackra file contract:
 * Purpose: the messages module: one outbound message per queued call, delivered by a retried job
 *          through the MailTransport port; the in-app inbox; notification preferences; the
 *          inbound-mail cancel.
 * Boundary: exports nothing, so it is the bare `Module`; the service has one module. The key is the
 *           folder name (`messages`) and is the namespace of every permission, event, setting and
 *           i18n key in it. Mail templates belong to the producing service (ADR 0223): producers
 *           render through @stackra/notifications and queue `messages.message.send@1`; this module
 *           owns delivery, preferences and the log.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 12, 13 and 16), ADR 0263, ADR 0223
 */
import { Module } from "@stackra/app";

/** `messages` is the namespace of every key in this folder (`messages.message.send@1`, …). */
export class MessagesModule extends Module {}
