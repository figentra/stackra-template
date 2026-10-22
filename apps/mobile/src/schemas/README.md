# src/schemas

Schema classes (`class X extends Schema(z.object(…)) {}`): value and type under one name, never
`new`-ed. Shared by the routes (`params`), the form adapters, the page hooks and the block registry,
so a shape is declared once. Zod is visible here on purpose: wire DTOs need its composition;
hydrated classes (config) use field decorators instead.

| File                            | Used by                                                                                      |
| ------------------------------- | -------------------------------------------------------------------------------------------- |
| `order-detail-params.schema.ts` | `routes/order-detail.route.ts` `params`                                                      |
| `create-order-params.schema.ts` | `routes/create-order.route.ts` `params`                                                      |
| `orders-filter.schema.ts`       | `routes/orders.route.ts` `params` (over the producer's `OrderStatus` enum codec)             |
| `create-order.schema.ts`        | the create-order form, derived from `Commerce.actions.CreateOrder.input` (never re-declared) |
| `promo-banner.schema.ts`        | `blocks/promo-banner` props; a navigate verb holds a `RouteKey`                              |

Tests: `__tests__/<name>.schema.test.ts`, pure, no DOM.
