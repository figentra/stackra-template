/**
 * Stackra file contract:
 * Purpose: the ./contracts entry of the commerce service: the types and codes of its public actions
 *          and events .
 * Boundary: types and codes only, no behaviour: schema types, the class enums whose codes travel on
 *           the wire, and the public event classes. Consumers do not import this entry: gen
 *           projects it, with the actions, into the committed .stackra/app-manifest.json, and other
 *           services' clients and event maps are generated from that.
 * Runtime: isomorphic
 * Governing contract: ADR 0117, 0158, 0260
 */
export type { CreateOrderInput } from "#modules/orders/schemas/create-order-input.schema";
export type { CreateOrderOutput } from "#modules/orders/schemas/create-order-output.schema";
export type { CancelOrderInput } from "#modules/orders/schemas/cancel-order-input.schema";
export type { CancelOrderOutput } from "#modules/orders/schemas/cancel-order-output.schema";
export type { OrderView } from "#modules/orders/schemas/order-view.schema";
export type { OrderListFilter } from "#modules/orders/schemas/order-list-filter.schema";
export type { OrderPage } from "#modules/orders/schemas/order-page.schema";
export type { ProductView } from "#modules/catalogue/schemas/product-view.schema";
export type { StorefrontProductView } from "#modules/catalogue/schemas/storefront-product-view.schema";
export type { StorefrontProductCard } from "#modules/catalogue/schemas/storefront-product-card.schema";
export type { StorefrontListFilter } from "#modules/catalogue/schemas/storefront-list-filter.schema";
export type { StorefrontProductPage } from "#modules/catalogue/schemas/storefront-product-page.schema";
export { OrderStatus } from "#modules/orders/enums/order-status.enum";
export { CancelReason } from "#modules/orders/enums/cancel-reason.enum";
export { ProductStatus } from "#modules/catalogue/enums/product-status.enum";
export { OrderPlaced } from "#modules/orders/events/order-placed.event";
export { OrderPaid } from "#modules/orders/events/order-paid.event";
export { OrderCancelled } from "#modules/orders/events/order-cancelled.event";
export { ProductArchived } from "#modules/catalogue/events/product-archived.event";
