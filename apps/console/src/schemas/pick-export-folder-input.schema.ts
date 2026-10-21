/**
 * Stackra file contract:
 * Purpose: the input of `console.export.pick_folder`: the dialog title key.
 * Boundary: one schema class; the default folder is the last one chosen, remembered by the
 *           filesystem port.
 * Runtime: isomorphic
 * Governing contract: ADR 0251, ADR 0095
 */
import { I18nKey } from "@stackra/i18n";
import { Schema, z } from "@stackra/schema";
import { I18n } from "#stackra/i18n";

/** The title is translated in main with the renderer's locale. */
export class PickExportFolderInput extends Schema(
  z.object({ titleKey: I18nKey.schema.default(I18n.console.export.pick_folder) }),
) {}
