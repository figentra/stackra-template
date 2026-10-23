/**
 * Stackra file contract:
 * Purpose: the staff screens for products in the admin area: list, create, edit and view, with
 *          archive as a row action. Declared here, rendered by @stackra/panel.
 * Boundary: a declaration only (a service ships no client UI). Pages follow from `operations`:
 *           `list`, `create` and `update` are `true`, so gen writes the standard
 *           `catalogue.product.list@1`, `.create@1` and `.update@1` over ProductService (the
 *           create gated by ProductLimitEntitlement); `get` is the hand-written GetProductQuery the
 *           View page reads. Archive and attach-image are hand-written actions referenced by class;
 *           the `images` field uploads through the bucket's signed URL and attaches with
 *           AttachProductImageAction. Column, field and entry keys are `keyof Product`, so gen
 *           fails on a field the model does not have. The title is the derived i18n key
 *           `catalogue::resources.product.title`; the status column is the built-in enum column.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 3, 11, 13 and 16), ADR 0164 (panels are resources),
 *                     ADR 0082 (API areas), ADR 0105 (as amended), ADR 0139
 */
import { ApiArea } from "@stackra/contracts";
import { type Actions, type Form, type Infolist, Resource, type Table } from "@stackra/panel";
import { Icons } from "@stackra/ui/icons";
import { I18n } from "#stackra/i18n";
import { ArchiveProductAction } from "#modules/catalogue/actions/archive-product.action";
import { AttachProductImageAction } from "#modules/catalogue/actions/attach-product-image.action";
import { Product } from "#modules/catalogue/models/product.model";
import { GetProductQuery } from "#modules/catalogue/queries/get-product.query";

/** Row actions hide when the permission or the record policy refuses. */
export class ProductResource extends Resource(Product, {
  area: ApiArea.Admin,
  navigation: {
    group: I18n.catalogue.nav.catalogue,
    icon: Icons.Package,
    order: 10,
  },
  operations: {
    list: true,
    get: GetProductQuery,
    create: true,
    update: true,
  },
}) {
  /** The list: searchable by title, filterable by status, the variant count per row. */
  override table(t: Table<Product>) {
    return t
      .columns((c) => [
        c.text("title").searchable(),
        c.text("slug"),
        c.enum("status"),
        c.count("variants"),
      ])
      .filters((f) => [f.select("status")]);
  }

  /**
   * Create and edit: rules come from the model's fields (the translatable title per locale);
   * images upload through the bucket's signed URL and attach with AttachProductImageAction;
   * variants are edited inline.
   */
  override form(f: Form<Product>) {
    return f.fields((x) => [
      x.from("title"),
      x.from("slug"),
      x.upload("images", {
        action: AttachProductImageAction,
        label: I18n.catalogue.product.images,
      }),
      x.repeater("variants", (v) => [v.from("sku"), v.from("barcode"), v.from("trackInventory")]),
    ]);
  }

  /** The View page: the title, the status and the variants. */
  override infolist(i: Infolist<Product>) {
    return i.entries((e) => [e.from("title"), e.enum("status"), e.relation("variants")]);
  }

  /** Archive on a row and on the View page; the record fills `productId`. */
  override actions(a: Actions<Product>) {
    return [a.run(ArchiveProductAction)];
  }
}
