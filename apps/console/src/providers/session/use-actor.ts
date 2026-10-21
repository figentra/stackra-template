/**
 * Stackra file contract:
 * Purpose: the one hook that reads the signed-in actor and the loading flag from the session.
 * Boundary: a projection over the identity package; redirecting on a missing session is the layout
 *           guard's job.
 * Runtime: browser
 * Governing contract: ADR 0241
 */
import type { Actor } from "@stackra/contracts";
import { useSession } from "@stackra/identity/react";

/** What the hook returns. */
export interface ActorState {
  /**
   * The signed-in actor; `null` signed out or while loading. Under `ShellLayout` the guard ran, so
   * it is set.
   */
  readonly actor: Actor | null;
  /** True until the first session answer arrives. */
  readonly isLoading: boolean;
}

/** Re-renders when the session changes, nothing else. */
export function useActor(): ActorState {
  const session = useSession();
  return { actor: session.user ?? null, isLoading: session.isLoading };
}
