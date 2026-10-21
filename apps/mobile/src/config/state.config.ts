/**
 * Stackra file contract:
 * Purpose: one fact: local client state persistence: where `@Store({ persist })` state goes, how it
 *          hydrates, and the devtools.
 * Boundary: the stores themselves are `src/stores/`; this names the storage area they persist into
 *           (`Prefs`, the mmkv driver on native) and whether first render waits for hydration.
 * Runtime: isomorphic
 * Governing contract: ADR 0079, ADR 0256
 */
import { Config } from "@stackra/config";
import { StorageArea } from "@stackra/storage";
import { Bool, OneOf } from "@stackra/validation";

/** Persisted stores land in `Prefs` (per install); devtools follow the build mode unless set. */
@Config("mobile.state")
export class StateConfig {
  /** The storage area persisted stores write to. @defaultValue StorageArea.Prefs */
  @OneOf(StorageArea) persistStore = StorageArea.Prefs;
  /** Force the state devtools on or off; unset follows the build mode. */
  @Bool() devtools?: boolean;
  /**
   * Keep the splash until persisted stores are read (mmkv is synchronous, so this costs nothing).
   * @defaultValue true
   */
  @Bool() blockingHydration = true;
}
