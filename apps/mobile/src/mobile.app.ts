/**
 * Stackra file contract:
 * Purpose: the mobile app's root: the theme, the provider stack in mount order, the root layout and
 *          the panel it hosts. Everything else is discovered by folder and decorator (routes,
 *          layouts, blocks, documents, menus, overrides, stores, config) and wired by gen; nothing
 *          is listed twice. Build targets live only in `stackra.config.ts`.
 * Boundary: a declaration. Packages with a config class are registered by the generated entry with
 *           that config and the target's drivers and are not listed here; feature flags are one of
 *           them (`FeatureFlagsConfig`, targeted by the signed-in user and the active tenant). Each
 *           folder under `providers/` holds exactly a `<name>.provider.ts` (a `@Provider` class,
 *           only when it runs code before mount), a `<name>.context.tsx` (the context component
 *           `<Name>ContextProvider`) and at most one `use-<name>.ts` hook. A provider with
 *           behaviour is listed by class; one without is listed by its context component:
 *           `session/`, context only: the ZITADEL PKCE session, hook `useRequireSession()`;
 *           `tenant/`: `TenantProvider` hydrates the remembered tenant, hook `useActiveTenant()`;
 *           `query/`, context only: the encrypted cache and offline queue from `QueryConfig`;
 *           `realtime/`: `RealtimeProvider` connects before mount, the context reconnects on
 *           foreground; `push/`: `PushProvider` prepares channels, the context registers the
 *           device, hook `usePushPermission()`; `theme/`, context only, named as `theme`: the
 *           colour scheme and the UI kit with its toast region (the scheme hook is
 *           @stackra/theming/react's).
 * Runtime: react-native
 * Governing contract: ADR 0263
 */
import { App } from "@stackra/app";
import { PlatformProvider } from "@stackra/platform/react";
import { PushProvider } from "#src/providers/push";
import { TenantQueryContextProvider } from "#src/providers/query";
import { RealtimeProvider } from "#src/providers/realtime";
import { SessionContextProvider } from "#src/providers/session";
import { TenantProvider } from "#src/providers/tenant";
import { ThemeContextProvider } from "#src/providers/theme";
import { TabsLayout } from "#src/routes/tabs.layout";
import { Panels } from "#stackra/panels";

/**
 * Session → tenant (scopes the query cache) → query → platform → realtime → push (needs all of
 * them). The generated entry mounts the container, i18n with the RTL switch, then `theme`, whose
 * UI kit already renders the toast region so every provider here can raise one, then this list,
 * then the navigation container with `#stackra/navigation`.
 */
@App({
  theme: ThemeContextProvider,
  providers: [
    SessionContextProvider,
    TenantProvider,
    TenantQueryContextProvider,
    PlatformProvider,
    RealtimeProvider,
    PushProvider,
  ],
  layout: TabsLayout,
  panels: [Panels.TenantAdmin],
})
export class MobileApp {}
