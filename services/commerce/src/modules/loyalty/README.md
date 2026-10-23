# loyalty

The extender. Shows how a module changes another module's behaviour without touching its files, and
how a service hosts a package (`@acme/loyalty-kit`). It has no `loyalty.module.ts`: it exports
nothing, so the folder is the module. An extension POINT is the seam another module owns and calls
(orders' `OrderExtensionPoint`); an EXTENSION here is one class that implements one slot of it. Each
file's path says its kind and its class extends one kind base (Stackra ADR 0294).

| Need                                  | Mechanism                                                                    | File                                               |
| ------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------- |
| Cut an amount off the order total     | `Extension<OrderExtensionPoint["adjustTotals"]>({ order: 200 })`, `handle`   | `extensions/redeem-points.extension.ts`            |
| Add a typed field to the create input | `input: RedeemPointsRequest` → `extensions.loyalty` in every client          | `schemas/redeem-points-request.schema.ts`          |
| Refuse the order early                | `Extension<OrderExtensionPoint["verifyPlacement"]>` (a `before` slot)        | `extensions/verify-points-balance.extension.ts`    |
| Hold the points atomically            | `Extension<OrderExtensionPoint["reservePlacement"]>` → `LoyaltyService.hold` | `extensions/hold-points.extension.ts`              |
| Earn after payment                    | `extends Listener({ queue })`, `handle(event: OrderPaid)` → `AccountService` | `listeners/earn-on-order-paid.listener.ts`         |
| Settle once the order exists          | `extends Listener`, `handle(event: OrderPlaced)` → `LoyaltyService.settle`   | `listeners/settle-on-order-placed.listener.ts`     |
| Give the points back                  | `handle(event: OrderCancelled)` → `LoyaltyService.release`                   | `listeners/release-on-order-cancelled.listener.ts` |
| Give a package data it needs          | `extends Driver(LoyaltyMembers)`, named `commerce` by its file prefix        | `drivers/commerce-loyalty-members.driver.ts`       |
| Own an adjustment code                | an `Enum.of` whose case is the stored code                                   | `enums/adjustment-code.enum.ts`                    |
| Prove it                              | `fakeExtensionContext`, `drainOutbox`, `toEmit(PointsEarned)`                | `extensions/__tests__/`, `listeners/__tests__/`    |

Points are never overdrawn: `reservePlacement` runs in the transaction that writes the order, and
`hold` is one covered debit per member, so of two orders racing for the same points the second is
refused (`insufficient_points`), its order rolls back and its stock is released. A cancelled,
expired or payment-refused order releases its hold exactly once, settled or not.

Every id crosses into the kit as a `MemberId` through `memberId(...)`. Rule of thumb: change a value
**before** commit → extension. React **after** commit → listener. Another service reacts → an
integration event.
