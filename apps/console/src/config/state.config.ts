/**
 * Stackra file contract:
 * Purpose: the console's override of @stackra/state's configuration: local client state (ADR 0079),
 *          where persisted store state goes, hydration and devtools.
 * Boundary: an override declares `override` members only and inherits the base's key (`state`). The
 *           stores themselves are `src/stores/`; nothing server-owned is ever copied into them. The
 *           class keeps the base's name and imports the base as `BaseStateConfig`; a second
 *           override of the same base fails gen.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decision 19; as amended by programming model v3.1, AGENTS.md: the
 *                     Base alias), ADR 0079 d2, ADR 0256
 */
import { StateConfig as BaseStateConfig } from "@stackra/state";
import { StorageArea } from "@stackra/storage";

/** Local client state: where persisted store state goes, hydration and devtools. */
export class StateConfig extends BaseStateConfig {
  /** Persisted stores land in this storage area. */
  override persistStore: StorageArea = StorageArea.Prefs;

  /** Devtools always run in development; this also enables them in a production build. */
  override devtoolsInProduction = false;

  /** Hydrate persisted state before the first render instead of rendering, then patching. */
  override blockingHydration = true;
}
