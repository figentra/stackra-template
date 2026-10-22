/**
 * Stackra file contract:
 * Purpose: proves the print bridge reaches the printer port with the lines and the drawer kick, and
 *          the generated handler table refuses an undeclared key, an invalid input and a foreign
 *          sender before any main code runs.
 * Boundary: unit tier, node; the printer is `@stackra/peripherals/testing`'s fake; the handler
 *           table is the committed gen sample, imported through the package's subpath.
 * Runtime: node
 * Governing contract: ADR 0022, ADR 0251 (allow-list), ADR 0007
 */
import { describe, expect, it } from "@stackra/testing";
import { CoreRefusals } from "@stackra/errors";
import { refusal } from "@stackra/errors/testing";
import { fakeReceiptPrinter } from "@stackra/peripherals/testing";
import { runBridge } from "@stackra/platform/testing";
import { handlers } from "#stackra-desktop/handlers";
import { PrintReceiptBridge } from "#src/bridges/print-receipt.bridge";

/** A sender the generated handler accepts: the bundled renderer's main frame. */
const SENDER = { senderUrl: "app://bundle/index.html", isMainFrame: true };

/** Guards the desktop receipt bridge that reaches hardware. */
describe(PrintReceiptBridge, () => {
  /** The declared lines and drawer option must reach the printer exactly as requested. */
  it("prints the lines and opens the drawer when asked", async () => {
    const printer = fakeReceiptPrinter();
    const input = {
      orderId: "ord_01J9Z3K4M5N6P7Q8R9S0T1V2W3",
      lines: ["Total 12.00"],
      openDrawer: true,
    };
    const result = await runBridge(PrintReceiptBridge, input, { replace: [printer] });
    expect(result.printer).toBe(printer.deviceName);
    expect(printer.jobs()).toEqual([{ lines: ["Total 12.00"], cut: true, drawer: true }]);
  });

  /** The allow-list, the schema and the sender check all run before any main code (ADR 0251). */
  it("refuses an undeclared key, an invalid input and a foreign sender", async () => {
    const bridged = refusal(CoreRefusals.bridge_rejected);
    await expect(
      handlers.invoke({ key: "console.receipt.nope", input: {} }, SENDER),
    ).rejects.toRefuseWith(bridged);
    await expect(
      handlers.invoke({ key: "console.receipt.print", input: { orderId: "x", lines: [] } }, SENDER),
    ).rejects.toRefuseWith(refusal(CoreRefusals.validation));
    const foreign = { ...SENDER, senderUrl: "https://evil.example" };
    const valid = { orderId: "ord_01J9Z3K4M5N6P7Q8R9S0T1V2W3", lines: ["a"] };
    await expect(
      handlers.invoke({ key: "console.receipt.print", input: valid }, foreign),
    ).rejects.toRefuseWith(bridged);
  });
});
