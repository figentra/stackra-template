/**
 * Stackra file contract:
 * Purpose: the barcode scanner, a full-screen presentation over the create-order sheet; a found
 *          variant replaces it with the sheet, pre-filled.
 * Boundary: a route class: options only. `capability: { scanner: Capability.Required }` lands in
 *           `#stackra/capabilities`: a target without a scanner fails gen; a device without a
 *           camera is still a runtime state the page renders. `flag` hides the route and every
 *           entry point while the tenant's quick-order flag is off. The page is `scan.tsx`, bound
 *           by name; the title is `pages::scan.title`.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decisions 14 and 16), ADR 0081, ADR 0250, ADR 0253
 */
import { Presentation, Route } from "@stackra/navigation";
import { Capability } from "@stackra/platform";
import { ProductPermissions } from "#stackra/clients/commerce";
import { Flags } from "#stackra/flags";

/** The phone's quick-order entry, so it follows the orders module's quick-order flag. */
export class ScanRoute extends Route({
  path: "/scan",
  permission: ProductPermissions.read,
  flag: Flags.orders.quick_order,
  presentation: Presentation.FullScreen,
  capability: { scanner: Capability.Required },
}) {}
