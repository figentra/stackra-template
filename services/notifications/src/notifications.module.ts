/**
 * Stackra file contract:
 * Purpose: the root of the notifications service.
 * Boundary: wiring only (ADR 0259 d4). It hosts no package module, so `imports` is empty; the
 *           messages module is found under src/modules/; the commerce client and event classes are
 *           generated from commerce's committed manifest (consumption inferred from
 *           `#stackra/clients` imports), not imported.
 * Runtime: node
 * Governing contract: ADR 0090, 0260, 0263, guides/programming-model.mdx#modules
 */
import { Module } from "@stackra/container";

/** Root module of the notifications service. */
@Module({ key: "notifications", imports: [] })
export class NotificationsModule {}
