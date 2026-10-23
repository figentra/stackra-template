# loyalty

The extender. Shows how a module changes another module's behaviour without touching its files, and
how a service hosts a package (`@acme/loyalty-kit`). Each file's path says its kind and its class
extends one kind base (Stackra ADR 0294).

| Need                                  | Mechanism                                                                    | File                                            |
| ------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------- |
| Cut an amount off the order total     | `extends Extension(OrderExtensionPoint, { order: 200 })`, `adjustTotals`     | `extensions/redeem-points.extension.ts`         |
| Add a typed field to the create input | `input: RedeemPointsRequest` → `extensions.loyalty` in every client          | `schemas/redeem-points-request.schema.ts`       |
| Refuse the order                      | `extends Extension(OrderExtensionPoint)`, `verifyPlacement` (verify)         | `extensions/verify-points-balance.extension.ts` |
| Earn after payment                    | `extends Listener({ queue })`, `handle(event: OrderPaid)` → `AccountService` | `listeners/earn-on-order-paid.listener.ts`      |
| Debit after placement                 | `extends Listener`, `handle(event: OrderPlaced)` → `LoyaltyService.redeem`   | `listeners/redeem-on-order-placed.listener.ts`  |
| Give a package data it needs          | `extends Driver(LoyaltyMembers)`, named `commerce` by its file prefix        | `drivers/commerce-loyalty-members.driver.ts`    |
| Own an adjustment code                | an `Enum.of` whose case is the stored code                                   | `enums/adjustment-code.enum.ts`                 |
| Prove it                              | `fakeExtensionContext`, `drainOutbox`, `toEmit(PointsEarned)`                | `extensions/__tests__/`, `listeners/__tests__/` |

Every id crosses into the kit as a `MemberId` through `memberId(...)`. Rule of thumb: change a value
**before** commit → extension. React **after** commit → listener. Another service reacts → an
integration event.
