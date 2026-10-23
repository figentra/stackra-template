/**
 * Stackra file contract:
 * Purpose: the staff screens for products in the admin area: a searchable list with views and CSV
 *          import, a four-step create wizard (the same steps as tabs on Edit), the View page, and
 *          archive and attach-image buttons. Declared here, rendered by @stackra/panel.
 * Boundary: a declaration only (a service ships no client UI); gen runs each member once and
 *           records the tree in the manifest. `Resource<Product, ProductView>`: the model is the
 *           subject and ProductView is the row, because the generated list returns views, so table,
 *           view and entry keys are paths of ProductView and form keys are paths of the generated
 *           create input. Pages follow from `operations`: `list`, `create` and `update` are `true`,
 *           so gen writes `catalogue.product.list@1`, `.create@1` and `.update@1` over
 *           ProductService (the create gated by ProductLimitEntitlement); `get` is the hand-written
 *           GetProductQuery the View page reads. The table is a server contract: search comes from
 *           the model's `@Searchable`, `status` filters on `idx_products_tenant_id_status` and
 *           `slug` sorts on `idx_products_tenant_id_slug`. Buttons sit where their input shape puts
 *           them: archive (record id only) on the row and View, in bulk with `.bulk()`;
 *           attach-image (record id plus fields, so a modal form) narrowed to View and Edit; import
 *           in the list header and the empty state. Labels are the derived keys
 *           `catalogue::resources.product.*`.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 3, 11, 13 and 16, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0164 (as amended for v3.1), ADR 0082 (API areas),
 *                     ADR 0105 (as amended), ADR 0139, ADR 0221
 */
import { ApiArea, SortDirection } from "@stackra/contracts";
import {
  ActionPlace,
  type Actions,
  type CreateInput,
  type Form,
  ImportMode,
  type Infolist,
  Resource,
  ResourcePage,
  type Table,
  type Views,
} from "@stackra/panel";
import { I18n } from "#stackra/i18n";
import { ArchiveProductAction } from "#modules/catalogue/actions/archive-product.action";
import { AttachProductImageAction } from "#modules/catalogue/actions/attach-product-image.action";
import { ProductStatus } from "#modules/catalogue/enums/product-status.enum";
import type { Product } from "#modules/catalogue/models/product.model";
import { GetProductQuery } from "#modules/catalogue/queries/get-product.query";
import type { ProductView } from "#modules/catalogue/schemas/product-view.schema";

/** Products under Catalogue; the navigation badge counts the drafts still being set up. */
export class ProductResource extends Resource<Product, ProductView>({
  area: ApiArea.Admin,
  navigation: {
    group: I18n.catalogue.nav.catalogue,
    icon: "package",
    order: 10,
    badge: "drafts",
  },
  operations: {
    list: true,
    get: GetProductQuery,
    create: true,
    update: true,
  },
}) {
  /** Alphabetical by slug; the status filter is pinned beside the search box. */
  override table(t: Table<ProductView>) {
    return t
      .columns((c) => [
        c.from("title"),
        c.from("slug").copyable().sortable(),
        c.from("status"),
        c.count("variants"),
      ])
      .filters((f) => [f.from("status").pinned()])
      .defaultSort("slug", SortDirection.Asc);
  }

  /** Presets beside the Default view. */
  override views(v: Views<ProductView>) {
    return [
      v.view("on_sale", { status: [ProductStatus.Active] }),
      v.view("drafts", { status: [ProductStatus.Draft] }),
      v.view("archived", { status: [ProductStatus.Archived] }),
    ];
  }

  /**
   * A four-step wizard on Create; Edit shows the same steps as tabs. `seo` is
   * `StorefrontSeo | null`, so `x.from("seo")` renders a switch that reveals its fields and sends
   * null when off; images upload through the bucket's signed URL and attach with
   * AttachProductImageAction.
   */
  override form(f: Form<CreateInput<Product>>) {
    return f.fields((x) => [
      x.steps("product", [
        x.step("basics", [x.grid(2, [x.from("title").span(2), x.from("slug")])]),
        x.step("media", [x.upload("images", { action: AttachProductImageAction })]),
        x.step("variants", [
          x.repeater("variants", (v) => [
            v.from("sku"),
            v.from("barcode"),
            v.from("trackInventory"),
          ]),
        ]),
        x.step("seo", [x.from("seo")]),
      ]),
    ]);
  }

  /** The View page: the title and status, then the variants by SKU. */
  override infolist(i: Infolist<ProductView>) {
    return i.entries((e) => [
      e.section("summary", [e.from("title"), e.from("slug").copyable(), e.from("status")]),
      e.section("variants", [e.list("variants", ["id", "sku"])]),
    ]);
  }

  /**
   * Archive on a row, on View and in bulk; attach an image from View or Edit; import products
   * from a file, matched by the unique slug, as create-or-update; New opens the View page after.
   */
  override actions(a: Actions<ProductView, ProductView>) {
    return [
      a.run(ArchiveProductAction).bulk(),
      a.run(AttachProductImageAction).in(ActionPlace.View, ActionPlace.Edit),
      a
        .import({ mode: ImportMode.Upsert, match: "slug", maxRows: 10_000 })
        .in(ActionPlace.ListHeader, ActionPlace.Empty),
      a.create().then(ResourcePage.View),
    ];
  }
}
