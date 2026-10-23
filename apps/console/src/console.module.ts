/**
 * Stackra file contract:
 * Purpose: the root module of the console. Panels, routes, layouts, menus, shortcuts, stores,
 *          blocks, documents and config classes are found by their group folders, so the class
 *          lists nothing.
 * Boundary: no `imports` (the console hosts no package module) and no `wrap`: every context the
 *           app needs is mounted by `createApp` from the config classes in the module graph, in
 *           graph order (session, tenancy, query, realtime, flags, push, platform, theme, i18n,
 *           consent, analytics, telemetry, then the UI kit with its toasts). Nobody writes a
 *           `main.tsx`: gen writes `.stackra/entry/browser.ts` and `.stackra/entry/electron.ts`,
 *           which pass this class and the generated wiring to `createApp`.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 12, 14 and 16), ADR 0295 (decisions 7 and 10), ADR 0263
 */
import { Module } from "@stackra/app";

/** The console as one module; its key (`console`) is the member key. */
export class ConsoleModule extends Module {}
