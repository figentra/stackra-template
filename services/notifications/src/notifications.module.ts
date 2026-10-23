/**
 * Stackra file contract:
 * Purpose: the root module of the notifications service.
 * Boundary: it hosts no package module, so it has no `imports` and is the bare `Module` (ADR 0259
 *           d4). The messages module is found under src/modules/; the commerce client and its
 *           event classes are generated from commerce's committed stackra.manifest.json, never
 *           imported. Nobody writes a `main.ts`: gen writes `.stackra/entry/server.ts`, which
 *           passes this class and the generated wiring to `createApp`.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 12 and 16), ADR 0295 (decisions 7 and 9), ADR 0260,
 *                     ADR 0263
 */
import { Module } from "@stackra/app";

/** The deployable of delivery, notification preferences, the message log and the in-app inbox. */
export class NotificationsModule extends Module {}
