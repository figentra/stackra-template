/**
 * Stackra file contract:
 * Purpose: the settings switch's hook: whether push is granted, and the two transitions (ask, open
 *          OS settings).
 * Boundary: a projection over the platform `push` port; `null` on a target without push so the
 *           switch is not rendered. The one hook of this provider folder.
 * Runtime: react-native
 * Governing contract: ADR 0250
 */
import { useCapability } from "@stackra/platform/react";

/** What the settings page renders from; `null` when the target has no push. */
export interface PushPermissionState {
  /** Whether the OS granted notifications to this install. */
  readonly isGranted: boolean;
  /** Shows the OS prompt (first time) or opens the app's notification settings (after a denial). */
  readonly request: () => Promise<void>;
  /** Opens the app's notification settings; the only way to revoke on iOS. */
  readonly openSettings: () => Promise<void>;
}

/** The switch's state. */
export function usePushPermission(): PushPermissionState | null {
  const push = useCapability("push", { required: false });
  if (!push) return null;
  return {
    isGranted: push.permission === "granted",
    request: async () => {
      if (push.permission === "denied") await push.openSystemSettings();
      else await push.register();
    },
    openSettings: () => push.openSystemSettings(),
  };
}
