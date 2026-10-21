/**
 * Stackra file contract:
 * Purpose: the orders module's manifest: what it shares with sibling modules. Everything else is
 *          discovered.
 * Boundary: the key equals the folder name (gen fails on a duplicate or malformed key, ADR 0264);
 *           no providers, no imports, no forFeature for its own kinds. Gen discovers every
 *           decorated class in this folder by kind folder + decorator, infers edges from
 *           constructor types and links (orders → catalogue, orders → inventory), and fails on
 *           injection of a class a sibling does not export.
 * Runtime: node
 * Governing contract: ADR 0263 (gen writes the wiring), ADR 0264 d1 (folder = key),
 *                     guides/programming-model.mdx#modules
 */
import { Module } from "@stackra/container";
import { OrderService } from "#modules/orders/services/order.service";

/**
 * Only OrderService is shared. `orders` is the namespace of every permission, event, i18n and
 * settings key in it.
 */
@Module({ key: "orders", exports: [OrderService] })
export class OrdersModule {}
