# loyalty

The extender. Shows how a module changes another module's behaviour without touching its files, and how a service
hosts a package (`@acme/loyalty-kit`).

| Need                                  | Mechanism                                                       | File                                             |
| ------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------ |
| Cut an amount off the order total     | `@Hook(OrderHooks)` implementing `adjustTotals` (transform)     | `hooks/redeem-points.hook.ts`                    |
| Add a typed field to the create input | `extends` on the hook → `extensions.loyalty` in every client    | `schemas/redeem-points-extension.schema.ts`      |
| Verify there (refuse the order)       | `@Hook(OrderHooks)` implementing `verifyPlacement` (verify)     | `hooks/verify-points-balance.hook.ts`            |
| Earn after payment                    | `@OnEvent(OrderPaid)` → the kit's `AccountService.earn`         | `listeners/earn-on-order-paid.listener.ts`       |
| Debit after placement                 | `@OnEvent(OrderPlaced)` → `LoyaltyService.redeem`               | `listeners/redeem-on-order-placed.listener.ts`   |
| Give a package data it needs          | `@Driver(LoyaltyMembers, "commerce")`, the port's one candidate | `./services/commerce-loyalty-members.service.ts` |
| Own an adjustment code                | a class enum, referenced by `.value` and `.label`               | `enums/adjustment-code.enum.ts`                  |
| Prove it                              | `fakeHookContext`, `drainOutbox`, `toEmit(PointsEarned)`        | `hooks/__tests__/`, `listeners/__tests__/`       |

Every id crosses into the kit as a `MemberId` through `memberId(...)`. Rule of thumb: change a value **before** commit
→ hook. React **after** commit → listener. Another service reacts → public event.
