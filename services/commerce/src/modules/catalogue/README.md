# catalogue

Products and variants. Never stores a price (prices belong to the pricing service) and never stores
stock (inventory). Exports `ProductService` to sibling modules.

| Kind        | Files                                                                         | Shows                                                                       |
| ----------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| model       | `models/product.model.ts`, `models/variant.model.ts`                          | `Translatable(["title"])`, a relation inside the module, every `@Index`     |
| state       | `states/product.state.ts`                                                     | Draft → Active → Archived on `@stackra/state-machine`; `Archive` records    |
| enum        | `enums/product-status.enum.ts`                                                | class enum with i18n labels                                                 |
| schema      | `schemas/*.schema.ts`                                                         | one schema per file: views, filters, pages, inputs                          |
| permission  | `permissions/product.permission.ts`                                           | read, create, update, archive; the only home of risk (ADR 0132)             |
| policy      | `policies/product.policy.ts`                                                  | the L2 `archive` verb: staff only                                           |
| event       | `events/product-archived.event.ts`                                            | one public `@Event`                                                         |
| errors      | `errors/*.error.ts`                                                           | `variant_unavailable`, `variant_not_found`, `product_not_found`             |
| service     | `./services/product.service.ts`                                               | `@Crud(Product, { actions, requires })`, `@Cacheable` by model tag          |
| entitlement | `entitlements/product-limit.entitlement.ts`                                   | `@Entitlement`: the plan's product limit gates the generated create         |
| search      | `search/product.search.ts`                                                    | `@SearchIndex(Product)`: the hybrid index the storefront and POS query      |
| bucket      | `buckets/product-images.bucket.ts`                                            | `@Bucket`: where product images upload, with types, size and variants       |
| action      | `actions/archive-product.action.ts`                                           | idempotent PUT transition, `@CacheEvict`, `offline`, confirmation UX        |
| action      | `actions/attach-product-image.action.ts`                                      | an `Upload` input claimed through `MediaLibrary` (signed URL, no bytes)     |
| query       | `queries/get-product.query.ts`, `queries/get-product-by-slug.query.ts`        | L0 reads; the public slug lookup under `/public`                            |
| query       | `queries/list-storefront-products.query.ts`                                   | `catalogue.product.list_storefront`: index search or table page             |
| query       | `queries/search-products.query.ts`                                            | `catalogue.product.search`: public ranked search, `/public/products/search` |
| query       | `queries/get-variant-by-barcode.query.ts`, `queries/search-variants.query.ts` | the mobile POS lookups (L0 through `ProductPermissions.read`)               |
| resource    | `resources/product.resource.ts`                                               | `table`, `form` (with an upload field), `infolist`                          |
| seed        | `seeds/demo.seed.ts`                                                          | seeder key `catalogue.demo`                                                 |
| factory     | `factories/*.factory.ts`                                                      | `ProductFactory.has(VariantFactory, n)`                                     |
| migration   | `migrations/*.migration.ts`                                                   | diff output: initial tables, expand steps, the search index                 |
| tests       | `actions/__tests__/`, `queries/__tests__/`, `entitlements/__tests__/`         | `run`, `toRecord`, `toRefuseWith`, `fakeUpload`, `fakeEntitlements`         |
