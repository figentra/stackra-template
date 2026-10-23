/**
 * Stackra file contract:
 * Purpose: the root module of the public site. Routes, the site layout, blocks, menus, the flag,
 *          the analytics event and config classes are found by their group folders, so the class
 *          lists nothing; blocks need no registry.
 * Boundary: no `imports` (the site hosts no package module) and no `wrap`: every context the site
 *           needs is mounted by `createApp` from the config classes in the module graph, in graph
 *           order (flags, theme, i18n, consent, analytics, telemetry, then the UI kit with its
 *           toasts). The resolved site is not a context: it is the site layout's loader data, read
 *           through `useSite`. Nobody writes an entry: gen writes `.stackra/entry/browser.ts` and
 *           `.stackra/entry/worker.ts`, which pass this class and the generated wiring to
 *           `createApp`.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 12, 14 and 16), ADR 0295 (decisions 7 and 10), ADR 0263
 */
import { Module } from "@stackra/app";

/** The public site as one module; its key (`web`) is the member key. */
export class WebModule extends Module {}
