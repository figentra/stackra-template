/**
 * Stackra file contract:
 * Purpose: `orders.quick_order`: the release switch for the staff quick-order screen in the console
 *          (and the mobile create-order shortcut). On by default; a tenant may be switched off
 *          during a rollout, never charged for it.
 * Boundary: a flag is a settings kind (ADR 0213 d3): a release switch, never a commercial right
 *           (entitlements gate what a plan includes). `key` is the one string, at the declaration
 *           site; gen prefixes the module key (`orders.quick_order`) and emits `#stackra/flags` for
 *           every consumer. `expires` makes gen fail (console `failOnExpired`) once the rollout is
 *           over and the flag was not removed.
 * Runtime: isomorphic
 * Governing contract: ADR 0213 d3, ADR 0231 (short keys); apps/console
 *                     `routes/quick-order.route.ts`
 */
import { Flag } from "@stackra/feature-flags";
import { SettingScope } from "@stackra/settings";
import { I18n } from "#stackra/i18n";

/**
 * Evaluated per tenant (the console's `targeting`); the value cascades platform → tenant like any
 * setting.
 */
@Flag({
  key: "quick_order",
  default: true,
  scopes: [SettingScope.Platform, SettingScope.Tenant],
  label: I18n.orders.flags.quick_order,
  expires: "2027-06-30",
})
export class QuickOrderFlag {}
