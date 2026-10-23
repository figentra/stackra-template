# src/schemas

Schema classes (`class X extends Schema`, or a subclass of a generated client shape): the field
types are the rules, the initializers the defaults, and gen compiles each class to one Zod schema in
`#stackra/schemas` (ADR 0294 decisions 4 and 26), so no Zod is written here. A shape is built with
`X.create({...})` and checked with `validate(X, raw)`, never `new`-ed. Shared by the routes
(`params`), the form adapter, the page hooks and the block's nested props, so each shape is declared
once. A union of shapes is a union of classes with an enum case as the discriminant.

| File                            | Class               | Used by                                                                           |
| ------------------------------- | ------------------- | --------------------------------------------------------------------------------- |
| `order-detail-params.schema.ts` | `OrderDetailParams` | `routes/order-detail/order-detail.route.ts` `params`                              |
| `create-order-params.schema.ts` | `CreateOrderParams` | `routes/create-order/create-order.route.ts` `params`                              |
| `orders-filter.schema.ts`       | `OrdersFilter`      | `routes/orders/orders.route.ts` `params` (over the producer's `OrderStatus`)      |
| `create-order-form.schema.ts`   | `CreateOrderForm`   | the create-order form, extending the action's `RequestedLine` (never re-declared) |
| `promo-banner-cta.schema.ts`    | `PromoBannerCta`    | `blocks/promo-banner` `cta`: a label and `NavigateEvent \| ActionEvent`           |
| `navigate-event.schema.ts`      | `NavigateEvent`     | the navigate verb (`CtaVerb.Navigate`) holding a generated `RouteKey`             |
| `action-event.schema.ts`        | `ActionEvent`       | the action verb (`CtaVerb.Action`) holding an action key                          |
| `env-options.schema.ts`         | `EnvOptions`        | `config/env.config.ts` `schema`: every public env value of the binary             |

The block's own props are fields of `PromoBannerBlock`, not a schema here. Tests:
`__tests__/<name>.schema.test.ts`, pure, no DOM.
