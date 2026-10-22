/**
 * Stackra file contract:
 * Purpose: mounts @stackra/query with the encrypted persisted cache and the offline mutation queue,
 *          both on @stackra/storage areas (sqlite, key in secure-store), scoped by
 *          `QueryConfig.scope`.
 * Boundary: a context component with no behaviour before mount, so the folder has no
 *           `.provider.ts`. It passes the config and nothing else: offline behaviour comes from the
 *           config and the generated `#stackra/offline` map the query module reads itself. Conflict
 *           records live in the outbox area.
 * Runtime: react-native
 * Governing contract: ADR 0059, ADR 0079, ADR 0252, ADR 0256
 */
import { useConfig } from "@stackra/config/react";
import { QueryProvider } from "@stackra/query/react";
import type { ReactNode } from "react";
import { QueryConfig } from "#src/config/query.config";

/** The provider takes only the subtree it wraps. */
export interface TenantQueryContextProviderProps {
  /** Everything that may call `useQuery`, `useAction` or `useMutationQueue`. */
  readonly children: ReactNode;
}

/** Mounts the query client; without a tenant (signed out) queries are disabled, not errored. */
export function TenantQueryContextProvider({ children }: TenantQueryContextProviderProps) {
  const query = useConfig(QueryConfig);
  return <QueryProvider config={query}>{children}</QueryProvider>;
}
