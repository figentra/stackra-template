/**
 * Stackra file contract:
 * Purpose: the console's root: the panels it mounts and the React provider order. Routes, layouts,
 *          menus, commands, bridges, blocks, stores, overrides and config are discovered by kind
 *          folder and decorator.
 * Boundary: the decorator options are the declaration gen reads; no DI provider list (gen writes
 *           wiring.ts), no `forRoot`, no values (those are `src/config/*`). `providers` is the
 *           React stack, outermost first: `@Provider` classes when they run code before mount,
 *           context components otherwise.
 * Runtime: browser
 * Governing contract: ADR 0263 (wiring is generated), ADR 0164 (panels)
 */
import { App } from "@stackra/app";
import { PlatformProvider } from "@stackra/platform/react";
import { Toast } from "@stackra/ui";
import { CustomerPortalPanel } from "#src/panels/customer-portal.panel";
import { TenantAdminPanel } from "#src/panels/tenant-admin.panel";
import { FlagsContextProvider } from "#src/providers/flags/flags.context";
import { RealtimeProvider } from "#src/providers/realtime/realtime.provider";
import { SessionProvider } from "#src/providers/session/session.provider";
import { TenantQueryContextProvider } from "#src/providers/tenant-query/tenant-query.context";
import { TenantProvider } from "#src/providers/tenant/tenant.provider";

/**
 * Session → tenant → query (scoped by tenant) → realtime (joins the tenant's channel) → flags
 * (targeted by tenant) → platform → toasts (innermost, so every provider above can raise one).
 * Container, i18n, theming, consent, analytics and telemetry are mounted by `createApp` from their
 * config classes and are not listed.
 */
@App({
  panels: [TenantAdminPanel, CustomerPortalPanel],
  providers: [
    SessionProvider,
    TenantProvider,
    TenantQueryContextProvider,
    RealtimeProvider,
    FlagsContextProvider,
    PlatformProvider,
    Toast.Provider,
  ],
})
export class ConsoleApp {}
