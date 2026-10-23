/**
 * Stackra file contract:
 * Purpose: the first tables of the orders module, `orders.orders` and `orders.order_lines`, with
 *          every column and `@Index` the models declared at the time.
 * Boundary: written by `stackra db diff` from `orders.order` and `orders.order_line`, reviewed,
 *           then committed and never edited. It changes only the module's own Postgres schema
 *           (`orders`); the table constants carry the qualified names, and gen creates the schema
 *           before the module's first migration. `stackra db compile` turns the blueprint into SQL
 *           with the lock and statement timeouts. Forward only: there is no `down()`.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13, 20, 27 and 28), ADR 0159 (as amended), ADR 0231
 *                     (index and key names)
 */
import { type Blueprint, Migration } from "@stackra/database";
import { OrderLines, Orders } from "#stackra/tables";
import { OrderStatus } from "#modules/orders/enums/order-status.enum";

/** `paid_at` is not here: it arrived later as an expand step (0002). */
export class CreateOrdersMigration extends Migration {
  /** Creates both tables, the customer index and the expiry job's status index. */
  up(schema: Blueprint): void {
    schema.create(Orders, (t) => {
      t.publicId("ord");
      t.tenant();
      t.timestamps();
      t.userStamps();
      t.versioned();
      t.string(Orders.columns.customerId, 30);
      t.enum(Orders.columns.status, OrderStatus); // text with ck_orders_status
      t.money(Orders.columns.subtotal); // subtotal_minor bigint, subtotal_currency char(3)
      t.jsonb(Orders.columns.adjustments);
      t.money(Orders.columns.total);
      t.string(Orders.columns.paymentId, 64).nullable();
      t.index([Orders.columns.customerId]); // idx_orders_customer_id
      // idx_orders_tenant_id_status_created_at, the expiry job's scan
      t.index([Orders.columns.tenantId, Orders.columns.status, Orders.columns.createdAt]);
    });
    schema.create(OrderLines, (t) => {
      t.publicId("oln");
      t.tenant();
      t.belongsTo(Orders).cascadeOnDelete(); // fk_order_lines_order_id and its index
      t.link(OrderLines.columns.variant); // variant_id varchar(30), indexed, no foreign key
      t.integer(OrderLines.columns.quantity);
      t.money(OrderLines.columns.unitPrice);
    });
  }
}
