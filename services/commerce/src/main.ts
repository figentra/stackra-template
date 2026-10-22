/**
 * Stackra file contract:
 * Purpose: process entry. Builds the app from the generated wiring and hands it to the generated
 *          runtime target.
 * Boundary: no logic here; `createApp` owns boot order, signal handling, readiness, drain, outbox
 *           flush and exit codes. Nothing in a service calls `process.on` or `process.exit` (lint).
 * Runtime: node
 * Governing contract: ADR 0263, ADR 0091 (Encore generated into .stackra/encore),
 *                     guides/programming-model.mdx#entry
 */
import { createApp } from "@stackra/app/server";
import { wiring } from "#stackra/wiring";
import { CommerceModule } from "./commerce.module";

/**
 * The booted service; the generated Encore target imports it. Top-level await: a boot error fails
 * the process.
 */
export const app = await createApp(CommerceModule, { wiring });
