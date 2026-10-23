# catalogue

Products and variants. Never stores a price (prices belong to the pricing service) and never stores
stock (inventory). Exports `ProductService` to sibling modules. Each file's path says its kind, its
class extends one kind base, and its identities are derived from names (Stackra ADR 0294); the
orders module is the reference for every kind, so this table lists only what catalogue adds.

| Group        | Files                                                           | Shows                                                                                |
| ------------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| (root)       | `catalogue.module.ts`                                           | `extends Module({ exports: [ProductService] })`                                      |
| `models/`    | `product.model.ts`, `variant.model.ts`                          | `Translatable([...])`, `Ref<Product>` with a foreign key, `@Searchable`, `@Index`    |
| `models/`    | `product.state-machine.ts`                                      | draft → active → archived; `archive` records `product.archived`                      |
| `models/`    | `product-images.bucket.ts`                                      | `extends Bucket({...})`: accepted types, size and image variants                     |
| `access/`    | `product.permissions.ts`, `product.policy.ts`                   | read, create, update, archive with their risk; the L2 `archive` rule                 |
| `access/`    | `product-limit.entitlement.ts`                                  | `Entitlement({ kind, counts })`: the plan's product limit gates the generated create |
| `services/`  | `product.service.ts`                                            | `CrudService(Product)`; the cached view through the injected `Cache`                 |
| `services/`  | `storefront.service.ts`                                         | `extends Service`: price (pricing client) and stock (inventory) for the public area  |
| `actions/`   | `archive-product.action.ts`                                     | idempotent PUT transition, `offline`, `ux.confirm`, the cache forgotten after commit |
| `actions/`   | `attach-product-image.action.ts`                                | an `Upload` field claimed through `MediaLibrary` (signed URL, no bytes)              |
| `queries/`   | `get-product.query.ts`, `get-product-by-slug.query.ts`          | L0 reads; the public slug lookup under `/public`                                     |
| `queries/`   | `list-storefront-products.query.ts`, `search-products.query.ts` | the public grid and the ranked search, both `StorefrontProductPage`                  |
| `queries/`   | `get-variant-by-barcode.query.ts`, `search-variants.query.ts`   | the mobile POS lookups, with `permission: ProductPermissions.read` named             |
| `schemas/`   | `*.schema.ts`                                                   | shapes two or more files use; single-use inputs are companions of their query        |
| `resources/` | `product/product.resource.ts`                                   | `operations: { list: true, create: true, update: true }`, `get`, a form with uploads |
| `database/`  | `migrations/`, `factories/`, `seeders/demo.seeder.ts`           | initial tables, expand steps, the search index; `ProductFactory.draft()`             |
| tests        | `access/__tests__/`, `actions/__tests__/`, `queries/__tests__/` | `run`, `toRecord`, `toRefuseWith`, `fakeUpload`, `fakeEntitlements`                  |

`operations` set to `true` make gen write `catalogue.product.list@1`, `.create@1` and `.update@1`
into `#stackra/operations` (`ProductOperations.Create` and the others), so tests and the panel name
them by class. The member root holds what the module reads but does not own:
`assets/lang/<locale>/catalogue.json`, the `I18n.catalogue.*` tree.
