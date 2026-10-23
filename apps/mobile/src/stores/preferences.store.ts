/**
 * Stackra file contract:
 * Purpose: the install's preferences as client state, persisted per device: the remembered tenant
 *          per user. The locale and the colour scheme are persisted by the i18n and theming
 *          packages themselves and are not duplicated here.
 * Boundary: a @stackra/state store (ADR 0079): its fields are the state, methods are the only
 *           writers, and persistence is one option (`StorageArea.Prefs`, the mmkv driver on
 *           native). The key is derived (`mobile.preferences`). The tabs layout reads the
 *           remembered tenant before the first tab renders; the profile page writes it on a switch.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 14 and 16), ADR 0079, ADR 0256
 */
import { Store } from "@stackra/state";
import { StorageArea } from "@stackra/storage";

/** Hydrated before the first frame (`MobileStateConfig.blockingHydration`). */
export class PreferencesStore extends Store({ persist: StorageArea.Prefs }) {
  /** User public id to the tenant they last chose; the first membership wins when absent. */
  tenantByUser: Record<string, string> = {};

  /** Remembers the tenant for a user; the query cache re-scopes on a switch, nothing is cleared. */
  rememberTenant(userId: string, tenantId: string): void {
    this.set((s) => ({ tenantByUser: { ...s.tenantByUser, [userId]: tenantId } }));
  }

  /** The remembered tenant for a user, or `undefined` on first sign-in. */
  tenantFor(userId: string): string | undefined {
    return this.tenantByUser[userId];
  }
}
