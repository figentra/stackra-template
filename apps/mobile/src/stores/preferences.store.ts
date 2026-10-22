/**
 * Stackra file contract:
 * Purpose: the install's preferences as client state, persisted per device: the remembered tenant
 *          per user. The locale and the colour scheme are persisted by the i18n and theming
 *          packages themselves and are not duplicated here.
 * Boundary: a @stackra/state store (ADR 0079): methods are the only writers, selectors are getters,
 *           persistence is one option (`state.config.ts` names the `prefs` store; the mmkv driver
 *           on native).
 * Runtime: isomorphic
 * Governing contract: ADR 0079, ADR 0256
 */
import { Store, StoreBase } from "@stackra/state";
import { StorageArea } from "@stackra/storage";

/** What is persisted. */
interface PreferencesState {
  /** User public id → the tenant they last chose; the first membership wins when absent. */
  readonly tenantByUser: Readonly<Record<string, string>>;
}

/**
 * Keyed `preferences` in the `Prefs` area; hydrated before first render
 * (`StateConfig.blockingHydration`).
 */
@Store({ key: "preferences", persist: StorageArea.Prefs })
export class PreferencesStore extends StoreBase<PreferencesState> {
  /** The state before anything was persisted: no remembered tenant for any user. */
  initial: PreferencesState = { tenantByUser: {} };

  /**
   * Remembers the tenant for a user; the query cache re-scopes on the switch, nothing is cleared.
   */
  rememberTenant(userId: string, tenantId: string): void {
    this.set((s) => ({ tenantByUser: { ...s.tenantByUser, [userId]: tenantId } }));
  }

  /** The remembered tenant for a user, or `undefined` on first sign-in. */
  tenantFor(userId: string): string | undefined {
    return this.state.tenantByUser[userId];
  }
}
