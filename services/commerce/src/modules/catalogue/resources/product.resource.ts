/**
 * Stackra file contract:
 * Purpose: the console screen for products (list, view, edit), declared, not coded. Rendered by
 *          @stackra/panel.
 * Boundary: a declaration only; the form binds to the generated `ProductCrud.Create` and `.Update`
 *           (a form with no bound create action is a gen error); archive and attach-image are
 *           hand-written actions referenced by class. The console renders `images` as an upload
 *           field bound to AttachProductImageAction.
 * Runtime: node
 * Governing contract: ADR 0164, 0139, ADR 0105 (where `@Crud` output lives),
 *                     guides/programming-model.mdx#resources
 */
import { FormBuilder, Infolist, Resource, Table } from "@stackra/panel";
import { Icons } from "@stackra/ui/icons";
import { Realm } from "@stackra/contracts";
import { ProductCrud } from "#stackra/crud";
import { I18n } from "#stackra/i18n";
import { Product } from "#modules/catalogue/models/product.model";
import { ArchiveProductAction } from "#modules/catalogue/actions/archive-product.action";
import { AttachProductImageAction } from "#modules/catalogue/actions/attach-product-image.action";

/**
 * The Products screen: CRUD from the model's fields, with archive as a row action. Tenant admin
 * only.
 */
@Resource(Product, {
  label: I18n.catalogue.resource.products,
  navigation: { group: I18n.catalogue.nav.catalogue, icon: Icons.Package, order: 10 },
  realms: [Realm.TenantAdmin],
  create: ProductCrud.Create,
  update: ProductCrud.Update,
})
export class ProductResource extends Resource<Product> {
  /** The list: searchable by title, filterable by status, variant count per row (`@Crud` list). */
  table(t: Table<Product>) {
    return t
      .columns((c) => [
        c.text("title").searchable(),
        c.text("slug"),
        c.badge("status"),
        c.count("variants"),
      ])
      .filters((f) => [f.select("status")])
      .rowActions([ArchiveProductAction]);
  }

  /**
   * Create and edit: fields come from the model decorators (validation, translatable title);
   * images upload through the bucket's signed URL and attach with AttachProductImageAction;
   * variants are edited inline.
   */
  form(f: FormBuilder<Product>) {
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

  /** The detail view. */
  infolist(i: Infolist<Product>) {
    return i.entries((e) => [e.from("title"), e.from("status"), e.relation("variants")]);
  }
}
