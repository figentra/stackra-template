/**
 * Stackra file contract:
 * Purpose: a product's sale state: `draft` is unseen by customers, `active` sells, `archived` is
 *          kept for order history.
 * Boundary: an `Enum.of` value plus the type of the same name. The code is the wire and column
 *           value; the tone is what the console colours the status with. Labels are the derived
 *           i18n keys `catalogue::enums.product_status.<code>`; transitions live in
 *           models/product.state-machine.ts.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4, 16 and 20), ADR 0161, ADR 0231 (snake_case codes)
 */
import { Enum, Tone } from "@stackra/contracts";

/**
 * Only `active` sells; `archived` is terminal. Cases are plain codes, compared with `===`.
 */
export const ProductStatus = Enum.of({
  Draft: ["draft", { tone: Tone.Default }],
  Active: ["active", { tone: Tone.Success }],
  Archived: ["archived", { tone: Tone.Default }],
});

/** One of the codes above. */
export type ProductStatus = Enum.Value<typeof ProductStatus>;
