/**
 * Stackra file contract:
 * Purpose: one fact: the point-of-sale peripherals of the desktop target, each a driver picked by
 *          name.
 * Boundary: drivers self-register with `@Driver(Port, name)` in @stackra/peripherals; this file
 *           only picks them, gen binds the choice in `#stackra/wiring`, and a custom class would be
 *           `@Replaces(ReceiptPrinter)`. Web and PWA targets get the WebUSB and WebHID drivers
 *           under the same names where they exist.
 * Runtime: isomorphic
 * Governing contract: ADR 0253 (peripherals: Web APIs first, ESC/POS preset), ADR 0231 (checked
 *                     driver names)
 */
import { Config, DriverOf } from "@stackra/config";
import type { DriverName } from "@stackra/container";
import { BarcodeScanner, CashDrawer, ReceiptPrinter } from "@stackra/peripherals/contracts";
import { Bool } from "@stackra/validation";

/** Point-of-sale peripherals of the desktop target, each a driver picked by name. */
@Config("console.peripherals")
export class PeripheralsConfig {
  /** ESC/POS over USB or network; `memory` keeps jobs for tests. @defaultValue "escpos" */
  @DriverOf(ReceiptPrinter) printer: DriverName<ReceiptPrinter> = "escpos";
  /** The drawer kicks through the printer port. @defaultValue "printer_kick" */
  @DriverOf(CashDrawer) drawer: DriverName<CashDrawer> = "printer_kick";
  /** HID keyboard-wedge scanner. @defaultValue "hid" */
  @DriverOf(BarcodeScanner) scanner: DriverName<BarcodeScanner> = "hid";
  /**
   * Probe devices at boot so the capability gate reflects what is plugged in.
   * @defaultValue true
   */
  @Bool() probeOnBoot = true;
}
