/**
 * Stackra file contract:
 * Purpose: one fact: local client state (ADR 0079): where `@Store({ persist })` state goes,
 *          hydration, devtools.
 * Boundary: the stores themselves are `src/stores/`; nothing server-owned is ever copied into them.
 * Runtime: isomorphic
 * Governing contract: ADR 0079 d2, ADR 0256
 */
import { Config } from "@stackra/config";
import { StorageArea } from "@stackra/storage";
import { Bool, OneOf } from "@stackra/validation";

/** Local client state: where persisted `@Store` state goes, hydration and devtools. */
@Config("console.state")
export class StateConfig {
  /** Persisted stores land in this storage area. @defaultValue StorageArea.Prefs */
  @OneOf(StorageArea) persistStore = StorageArea.Prefs;
  /**
   * Devtools always run in development; this also enables them in a production build.
   * @defaultValue false
   */
  @Bool() devtoolsInProduction = false;
  /**
   * Hydrate persisted state before the first render instead of rendering, then patching.
   * @defaultValue true
   */
  @Bool() blockingHydration = true;
}
