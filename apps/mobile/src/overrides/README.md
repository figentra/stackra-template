# src/overrides

One folder, one word, one review: every "I am changing someone else's thing" lives under
`overrides/<module>/`. A module declares what may be overridden (an `@OverridePoint` class, a lang
namespace, a public asset); gen builds `#stackra/overrides` from this folder, refuses a path or key
the owner does not declare, and types component props from the point. Code behaviour is never
overridden by file: implement the owner's hook point in a service, or `@Replaces` a class in DI.

| Path                                               | Overrides                                                 | Mechanism                                   |
| -------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------- |
| `orders/components/revenue-sparkline.override.tsx` | `Commerce.overrides.RevenueSparkline` (the widget's tile) | `@Override(Point, { component })` class     |
| `orders/lang/en.json`, `orders/lang/ar.json`       | `orders::order.cancel_confirm` (shorter on a phone)       | merged key by key over `orders`' lang files |

A module's own strings live in `assets/lang/<locale>/<namespace>.json`; another module's strings
live here, so an override looks like one in a diff.
