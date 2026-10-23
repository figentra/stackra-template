/**
 * Stackra file contract:
 * Purpose: `orders.quick_order`: the release switch for the staff quick-order screen in the console
 *          and the create-order shortcut in mobile. On by default; a tenant may be switched off
 *          during a rollout, never charged for it.
 * Boundary: a flag is a release switch with an expiry, never a commercial right (entitlements gate
 *           what a plan includes). The key is derived (`orders.quick_order`) and consumers read it
 *           as `Flags.orders.quick_order`; the label is the derived i18n key
 *           `orders::flags.quick_order.label`. Gen fails once `expires` has passed and the flag is
 *           still declared.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 13, 16 and 20), ADR 0213 d3 (a flag cascades like a
 *                     setting)
 */
import { Flag } from "@stackra/feature-flags";
import { SettingScope } from "@stackra/settings";

/** Evaluated per tenant; the value cascades platform → tenant like a setting. */
export class QuickOrderFlag extends Flag({
  default: true,
  scopes: [SettingScope.Platform, SettingScope.Tenant],
  expires: "2027-06-30",
}) {}
