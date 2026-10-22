/**
 * Stackra file contract:
 * Purpose: the barcode scanner, a full-screen modal over the create-order sheet; a found variant
 *          replaces the modal with the sheet, pre-filled.
 * Boundary: options only. `capability: { scanner: Capability.Required }` lands in
 *           `#stackra/capabilities`: a target without a scanner fails gen; a device without a
 *           camera is still a runtime state the page renders. `flag` hides the route and every
 *           entry point while the tenant's quick-order flag is off.
 * Runtime: react-native
 * Governing contract: ADR 0081, ADR 0250, ADR 0253
 */
import { Presentation, Route } from "@stackra/navigation";
import { Capability } from "@stackra/platform";
import { ScanPage } from "#src/components/pages/scan";
import { Commerce } from "#stackra/clients";
import { Flags } from "#stackra/flags";
import { I18n } from "#stackra/i18n";

/**
 * The scanner is the phone's quick-order entry, so it follows the orders module's quick-order flag.
 */
@Route({
  path: "/scan",
  auth: true,
  permission: Commerce.permissions.Product.read,
  flag: Flags.orders.quick_order,
  presentation: Presentation.FullScreenModal,
  capability: { scanner: Capability.Required },
  header: { title: I18n.mobile.scan.title },
  component: ScanPage,
})
export class ScanRoute {}
