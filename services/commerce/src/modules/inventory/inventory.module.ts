/**
 * Stackra file contract:
 * Purpose: the inventory module's manifest.
 * Boundary: exports StockService for orders; nothing else is shared. The key equals the folder name
 *           (ADR 0264).
 * Runtime: node
 * Governing contract: ADR 0263, ADR 0264 d1, guides/programming-model.mdx#modules; figentra-os
 *                     docs/catalogue/commerce.yaml#inventory
 */
import { Module } from "@stackra/container";
import { StockService } from "#modules/inventory/services/stock.service";

/** StockService is the only class orders may inject. */
@Module({ key: "inventory", exports: [StockService] })
export class InventoryModule {}
