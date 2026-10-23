/**
 * Stackra file contract:
 * Purpose: the orders module: what it shares with sibling modules. Everything else in the folder is
 *          discovered from its path and base class.
 * Boundary: the key is the folder name (`orders`) and is the namespace of every permission, event,
 *           setting and i18n key in it. No bindings list and no imports (those are on roots only):
 *           gen discovers each kind from its group folder, infers the module edges from constructor
 *           types and relations (orders → catalogue, orders → inventory), and fails on an injection
 *           of a class a sibling does not export.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 12, 13, 16, 20 and 24), ADR 0263 (gen writes the wiring)
 */
import { Module } from "@stackra/container";
import { OrderService } from "#modules/orders/services/order.service";

/** Only OrderService is shared with sibling modules. */
export class OrdersModule extends Module({ exports: [OrderService] }) {}
