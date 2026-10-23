/**
 * Stackra file contract:
 * Purpose: the console's override of @stackra/peripherals' configuration: the point-of-sale
 *          peripherals of the desktop target, each a driver picked by name.
 * Boundary: an override declares `override` members only and inherits the base's key
 *           (`peripherals`). Drivers are classes in the package's `drivers/`; this file only picks
 *           them, gen binds the choice in the main-process wiring, and a custom class would be
 *           bound with `@Replaces(ReceiptPrinter)`. The package also ships the bridge the renderer
 *           prints through, so the console writes none. Web and PWA targets get the WebUSB and
 *           WebHID drivers under the same names where they exist.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 17 and 19), ADR 0253 (peripherals: Web APIs first,
 *                     ESC/POS preset), ADR 0231 (checked driver names)
 */
import type { DriverName } from "@stackra/container";
import { PeripheralsConfig } from "@stackra/peripherals";
import type { BarcodeScanner, CashDrawer, ReceiptPrinter } from "@stackra/peripherals/contracts";

/** Point-of-sale peripherals of the desktop target, each a driver picked by name. */
export class ConsolePeripheralsConfig extends PeripheralsConfig {
  /** ESC/POS over USB or network; `memory` keeps jobs for tests. */
  override printer: DriverName<ReceiptPrinter> = "escpos";

  /** The drawer kicks through the printer port. */
  override drawer: DriverName<CashDrawer> = "printer_kick";

  /** HID keyboard-wedge scanner. */
  override scanner: DriverName<BarcodeScanner> = "hid";

  /** Probe devices at boot so the capability gate reflects what is plugged in. */
  override probeOnBoot = true;
}
