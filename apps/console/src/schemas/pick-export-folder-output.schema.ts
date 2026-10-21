/**
 * Stackra file contract:
 * Purpose: the output of `console.export.pick_folder`: the chosen folder.
 * Boundary: one schema class; a cancelled dialog is `folder: null`, not an error.
 * Runtime: isomorphic
 * Governing contract: ADR 0251, ADR 0095
 */
import { Schema, z } from "@stackra/schema";

/** `null` when the user cancelled. */
export class PickExportFolderOutput extends Schema(z.object({ folder: z.string().nullable() })) {}
