/**
 * Stackra file contract:
 * Purpose: the staff screens for storefront collections in the admin area: a list sorted by slug,
 *          and the create and edit form. Declared here, rendered by @stackra/panel.
 * Boundary: a declaration only (a service ships no client UI); gen runs each member once and
 *           records the tree in the manifest. `Resource<ProductCollection>`: the list row is the
 *           model, so table and form keys are its paths. `list`, `create` and `update` are `true`,
 *           so gen writes `catalogue.product_collection.list@1`, `.create@1` and `.update@1` over
 *           ProductCollectionService. `slug` sorts on `idx_product_collections_tenant_id_slug`.
 *           Products pick their collections in ProductResource's form. Labels are the derived keys
 *           `catalogue::resources.product_collection.*`.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 3, 11, 13 and 16, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0164 (as amended for v3.1), ADR 0082 (API areas)
 */
import { ApiArea, SortDirection } from "@stackra/contracts";
import { type CreateInput, type Form, Resource, type Table } from "@stackra/panel";
import { I18n } from "#stackra/i18n";
import type { ProductCollection } from "#modules/catalogue/models/product-collection.model";

/** Collections under Catalogue, after Products. */
export class ProductCollectionResource extends Resource<ProductCollection>({
  area: ApiArea.Admin,
  navigation: {
    group: I18n.catalogue.nav.catalogue,
    icon: "folders",
    order: 20,
  },
  operations: {
    list: true,
    create: true,
    update: true,
  },
}) {
  /** Alphabetical by slug. */
  override table(t: Table<ProductCollection>) {
    return t
      .columns((c) => [c.from("title"), c.from("slug").copyable().sortable()])
      .defaultSort("slug", SortDirection.Asc);
  }

  /** The translated title and the slug the store filters on. */
  override form(f: Form<CreateInput<ProductCollection>>) {
    return f.fields((x) => [x.grid(2, [x.from("title").span(2), x.from("slug")])]);
  }
}
