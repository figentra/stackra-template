/**
 * Stackra file contract:
 * Purpose: process entry. Builds the app from the generated wiring and hands it to the generated
 *          runtime target.
 * Boundary: no logic here; `createApp` owns boot order, signals, readiness, drain, outbox flush and
 *           exit codes.
 * Runtime: node
 * Governing contract: ADR 0263, 0091, guides/programming-model.mdx#entry
 */
import { createApp } from "@stackra/app/server";
import { wiring } from "#stackra/wiring";
import { NotificationsModule } from "./notifications.module";

/** The booted service; the generated Encore target imports it. */
export const app = await createApp(NotificationsModule, { wiring });
