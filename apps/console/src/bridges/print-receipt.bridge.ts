/**
 * Stackra file contract:
 * Purpose: `console.receipt.print`: prints a receipt on the configured ESC/POS printer from the
 *          Electron main process.
 * Boundary: a `@Bridge` runs in main only; the renderer reaches it through the generated preload,
 *           which checks the key, and the generated handler, which validates the input, the actor
 *           and the permission and wraps the result in the 0140 envelope. The printer is the
 *           peripherals port; the driver is peripherals.config.ts.
 * Runtime: node
 * Governing contract: ADR 0251 (bridge generated from the declaration), ADR 0253 (peripherals), ADR
 *                     0250
 */
import { ActorKind } from "@stackra/contracts";
import { ReceiptPrinter } from "@stackra/peripherals/contracts";
import { Capability } from "@stackra/platform";
import { Bridge, type BridgeContext } from "@stackra/platform/electron";
import { Commerce } from "#stackra/clients";
import { PrintReceiptInput } from "#src/schemas/print-receipt-input.schema";
import { PrintReceiptOutput } from "#src/schemas/print-receipt-output.schema";

/** A target without a printer driver hides the button (capability gate) instead of failing here. */
@Bridge({
  key: "receipt.print", // gen prefixes the member key on the wire: `console.receipt.print`
  input: PrintReceiptInput,
  output: PrintReceiptOutput,
  permission: Commerce.permissions.Order.read,
  actors: [ActorKind.User],
  capability: Capability.Print,
})
export class PrintReceiptBridge {
  constructor(private readonly printer: ReceiptPrinter) {}

  /**
   * Sends the lines to the printer port with a cut and the optional drawer kick.
   * @throws AppError `unavailable` (`printer_offline`) when the port reports no device; the
   * renderer shows it.
   */
  async handle(input: PrintReceiptInput, ctx: BridgeContext): Promise<PrintReceiptOutput> {
    const job = await this.printer.print({
      lines: input.lines,
      cut: true,
      drawer: input.openDrawer,
      correlationId: ctx.correlationId,
    });
    return { jobId: job.id, printer: job.deviceName };
  }
}
