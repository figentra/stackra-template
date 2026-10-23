/**
 * Stackra file contract:
 * Purpose: this app's override of @stackra/state's configuration: where persisted stores write and
 *          whether first render waits for them.
 * Boundary: an override declares `override` members only and inherits the base's key (`state`).
 *           The stores are `src/stores/`; this names the storage area they persist into (`Prefs`,
 *           the mmkv driver on native). Devtools follow the build mode, so they are not set here.
 *           A field typed by an enum restates its type.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decision 19), ADR 0079, ADR 0256
 */
import { StateConfig } from "@stackra/state";
import { StorageArea } from "@stackra/storage";

/** Persisted stores land in `Prefs` (per install) and are read before the first frame. */
export class MobileStateConfig extends StateConfig {
  /** The storage area persisted stores write to. */
  override persistStore: StorageArea = StorageArea.Prefs;

  /** Keep the splash until persisted stores are read; mmkv is synchronous, so it costs nothing. */
  override blockingHydration = true;
}
