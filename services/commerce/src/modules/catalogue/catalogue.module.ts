/**
 * Stackra file contract:
 * Purpose: the catalogue module's manifest: the classes other modules may inject.
 * Boundary: the key equals the folder name (ADR 0264); no providers, no imports. Catalogue never
 *           stores a price (pricing service) and never stores stock: the storefront projection
 *           reads inventory's exported StockService (gen records `dependsOn`).
 * Runtime: node
 * Governing contract: ADR 0263, ADR 0264 d1, guides/programming-model.mdx#modules
 */
import { Module } from "@stackra/container";
import { ProductService } from "#modules/catalogue/services/product.service";

/** ProductService is the in-process public surface; everything else in this folder is private. */
@Module({ key: "catalogue", exports: [ProductService] })
export class CatalogueModule {}
