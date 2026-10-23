/**
 * Stackra file contract:
 * Purpose: the settings page's tenant tab: the tenant-scoped settings this console edits, built
 *          from the generated settings metadata so bounds, defaults and labels are the ones the
 *          owning Settings classes declared.
 * Boundary: a shape class over `Settings.pick(...)`, which `#stackra/settings` builds from the
 *           consumed manifests; a change in a service's Settings class changes this form without an
 *           edit here. Values are read and written through the settings actions, never stored by
 *           the console. Shared by the settings route and its page.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 4 and 8), ADR 0213 (settings cascade)
 */
import { Settings } from "#stackra/settings";

/** Four keys from two modules, with the bounds and defaults their Settings classes declare. */
export class TenantSettings extends Settings.pick([
  Settings.orders.autoCancelAfterMinutes,
  Settings.orders.customersMayCancel,
  Settings.inventory.lowStockThreshold,
  Settings.inventory.allowBackorders,
]) {}
