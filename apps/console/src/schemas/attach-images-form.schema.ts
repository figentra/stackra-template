/**
 * Stackra file contract:
 * Purpose: `AttachImagesForm`: the attach-images form's fields: the product the images go to and
 *          one description shared by every image.
 * Boundary: a shape class shared by the attach-images component and its test; validated in the
 *           browser, then again by `AttachProductImageAction` on the server.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 4 and 16), ADR 0165 (form adapters)
 */
import type { PublicId } from "@stackra/contracts";
import { Schema, Str } from "@stackra/validation";

/** The target product and the screen-reader description the images share. */
export class AttachImagesForm extends Schema {
  /** The product of the variant picked in the combo box. */
  productId!: PublicId<"prd">;

  /** What the images show, for screen readers; empty sends no description. */
  @Str({ max: 200 })
  alt = "";
}
