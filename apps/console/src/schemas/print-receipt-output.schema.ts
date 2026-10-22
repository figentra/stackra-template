/**
 * Stackra file contract:
 * Purpose: the output of `console.receipt.print`: proof the job reached a printer.
 * Boundary: one schema class; `jobId` lets the renderer show "printed" in the order view.
 * Runtime: isomorphic
 * Governing contract: ADR 0251, ADR 0095
 */
import { Schema, z } from "@stackra/schema";

/** The printer's job id and the device name the job went to. */
export class PrintReceiptOutput extends Schema(
  z.object({ jobId: z.string(), printer: z.string() }),
) {}
