/**
 * Stackra file contract:
 * Purpose: the catalogue module: what it shares with sibling modules. Everything else in the folder
 *          is discovered from its path and base class.
 * Boundary: the key is the folder name (`catalogue`). No bindings list and no imports (those are on
 *           roots only). Catalogue never stores a price (the pricing service) and never stores
 *           stock: the storefront projection injects inventory's exported StockService, so gen
 *           records the catalogue → inventory edge.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 12, 13, 16 and 24), ADR 0263 (gen writes the wiring)
 */
import { Module } from "@stackra/app";
import { ProductService } from "#modules/catalogue/services/product.service";

/** ProductService is the in-process public surface; everything else in this folder is private. */
export class CatalogueModule extends Module({ exports: [ProductService] }) {}
