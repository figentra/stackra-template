/**
 * Stackra file contract:
 * Purpose: the console's override of @stackra/state's configuration: local client state (ADR 0079),
 *          where persisted store state goes, hydration and devtools.
 * Boundary: an override declares `override` members only and inherits the base's key (`state`).
 *           The stores themselves are `src/stores/`; nothing server-owned is ever copied into them.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decision 19), ADR 0079 d2, ADR 0256
 */
import { StateConfig } from "@stackra/state";
import { StorageArea } from "@stackra/storage";

/** Local client state: where persisted store state goes, hydration and devtools. */
export class ConsoleStateConfig extends StateConfig {
  /** Persisted stores land in this storage area. */
  override persistStore: StorageArea = StorageArea.Prefs;

  /** Devtools always run in development; this also enables them in a production build. */
  override devtoolsInProduction = false;

  /** Hydrate persisted state before the first render instead of rendering, then patching. */
  override blockingHydration = true;
}
