/**
 * Stackra file contract:
 * Purpose: the settings page's tenant tab: the tenant-scoped settings this console edits, built
 *          from the generated settings metadata so bounds, defaults and labels are the ones the
 *          owning `@Settings` classes declared.
 * Boundary: one schema class over `Settings.pick(...)`; a change in a service's `@Setting` changes
 *           this form without an edit here. Values are read and written through the settings
 *           actions, never stored by the console.
 * Runtime: browser
 * Governing contract: ADR 0213 (settings cascade), ADR 0095
 */
import { Schema } from "@stackra/schema";
import { Settings } from "#stackra/settings";

/**
 * Four keys from two modules; `Settings.pick` turns their metadata into the Zod object with bounds
 * and defaults.
 */
export class TenantSettings extends Schema(
  Settings.pick([
    Settings.orders.autoCancelAfterMinutes,
    Settings.orders.customersMayCancel,
    Settings.inventory.lowStockThreshold,
    Settings.inventory.allowBackorders,
  ]),
) {}
