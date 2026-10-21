/**
 * Stackra file contract:
 * Purpose: provides the realtime connection to `useSubscription` and the panel, and keeps it alive
 *          the way a phone needs: closed after a grace period in the background, reopened on
 *          foreground.
 * Boundary: no connect logic of its own (that is `realtime.provider.ts`); this component only
 *           follows the app state through the platform `appState` port. Subscriptions resume after
 *           a reconnect without re-rendering pages.
 * Runtime: react-native
 * Governing contract: ADR 0225, ADR 0250
 */
import { useConfig } from "@stackra/config/react";
import { useCapability } from "@stackra/platform/react";
import type { RealtimeConnection } from "@stackra/realtime";
import { RealtimeConnectionProvider } from "@stackra/realtime/react";
import { type ReactNode, useEffect } from "react";
import { RealtimeConfig } from "#src/config/realtime.config";

/** The hydrated connection and the tree. */
export interface RealtimeContextProviderProps {
  /** What `RealtimeProvider.hydrate` opened; `null` signed out. */
  readonly value: RealtimeConnection | null;
  /** The tree that may call `useSubscription`. */
  readonly children: ReactNode;
}

/** Follows foreground and background; renders children without a connection when signed out. */
export function RealtimeContextProvider({ value, children }: RealtimeContextProviderProps) {
  const config = useConfig(RealtimeConfig);
  const appState = useCapability("appState", { required: true });

  useEffect(() => {
    if (!value || !config.reconnectOnForeground) return;
    return appState.onChange((state) => {
      if (state.isForeground) value.resume();
      else value.suspend({ afterSeconds: config.backgroundGraceSeconds });
    });
  }, [value, appState, config.reconnectOnForeground, config.backgroundGraceSeconds]);

  if (!value) return <>{children}</>;
  return <RealtimeConnectionProvider connection={value}>{children}</RealtimeConnectionProvider>;
}
