/**
 * Stackra file contract:
 * Purpose: a product's sale state: `draft` is unseen by customers, `active` sells, `archived` is
 *          kept for order history.
 * Boundary: a house enum (class); transitions live in states/product.state.ts.
 * Runtime: isomorphic
 * Governing contract: guides/programming-model.mdx#enums
 */
import { Tone } from "@stackra/contracts";
import { Enum } from "@stackra/schema";
import { I18n } from "#stackra/i18n";

/**
 * `ProductStatus.schema` parses the wire string to the case; `.codes` is the literal union for
 * filters.
 */
export class ProductStatus extends Enum<ProductStatus> {
  /** Being set up; invisible to customers. */
  static readonly Draft = ProductStatus.case("draft", {
    label: I18n.catalogue.status.draft,
    color: Tone.Default,
  });
  /** On sale; the only status whose variants can be ordered. */
  static readonly Active = ProductStatus.case("active", {
    label: I18n.catalogue.status.active,
    color: Tone.Success,
  });
  /** Off sale, kept for order history; terminal. */
  static readonly Archived = ProductStatus.case("archived", {
    label: I18n.catalogue.status.archived,
    color: Tone.Default,
  });
}
