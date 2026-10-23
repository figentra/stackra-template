/**
 * Stackra file contract:
 * Purpose: the inventory module: what it shares with sibling modules. Everything else in the folder
 *          is discovered from its path and base class.
 * Boundary: the key is the folder name (`inventory`). No bindings list and no imports (those are on
 *           roots only). Orders reserves and releases stock and catalogue reads availability, both
 *           through the exported StockService; nothing else is shared.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 12, 13, 16 and 24), ADR 0263 (gen writes the wiring)
 */
import { Module } from "@stackra/container";
import { StockService } from "#modules/inventory/services/stock.service";

/** StockService is the only class sibling modules may inject. */
export class InventoryModule extends Module({ exports: [StockService] }) {}
