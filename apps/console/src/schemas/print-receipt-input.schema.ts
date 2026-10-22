/**
 * Stackra file contract:
 * Purpose: the input of `console.receipt.print`: the order's public id and the receipt lines the
 *          renderer formatted.
 * Boundary: one schema class; the generated bridge handler validates the renderer's input with it
 *           before main code runs. Main only sends bytes; it never formats.
 * Runtime: isomorphic
 * Governing contract: ADR 0251, ADR 0095
 */
import { PublicId, Schema, z } from "@stackra/schema";

/** 48 columns fit an 80 mm roll; 200 lines is the longest receipt a till prints. */
export class PrintReceiptInput extends Schema(
  z.object({
    orderId: PublicId("ord"),
    lines: z.array(z.string().max(48)).min(1).max(200),
    openDrawer: z.boolean().default(false),
  }),
) {}
