/**
 * Stackra file contract:
 * Purpose: mounts @stackra/query with the encrypted persisted cache and the offline mutation queue,
 *          scoped to the active tenant so a tenant switch never shows another tenant's cache.
 * Boundary: a context component without behaviour before mount. It passes the config and nothing
 *           else: scope, persistence and replay come from QueryConfig, which actions may queue from
 *           `#stackra/offline`; drivers (encrypted IndexedDB on web, safeStorage on desktop) are
 *           chosen by gen per target.
 * Runtime: browser
 * Governing contract: ADR 0079, ADR 0252, ADR 0256
 */
import type { ReactNode } from "react";
import { useConfig } from "@stackra/config/react";
import { QueryProvider } from "@stackra/query/react";
import { QueryConfig } from "#src/config/query.config";

/** The provider's props. */
export interface TenantQueryContextProviderProps {
  /** The app subtree that may call `useQuery` and `useAction`. */
  readonly children: ReactNode;
}

/**
 * Without a tenant (signed out) queries are disabled, not errored; the package reads the tenant
 * itself.
 */
export function TenantQueryContextProvider({ children }: TenantQueryContextProviderProps) {
  const query = useConfig(QueryConfig);
  return <QueryProvider config={query}>{children}</QueryProvider>;
}
