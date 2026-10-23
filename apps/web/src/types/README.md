# src/types

Types only, one exported declaration per file (`<name>.type.ts`): what a hook returns, and the
shapes a renderer receives after translation. A hook stays a plain function (`hooks/` when shared,
beside its component otherwise); its result type sits here so the hook file holds one declaration
and the class that reads it imports the type without the hook's module graph.

| File                              | Type                    | Returned by or read by                                      |
| --------------------------------- | ----------------------- | ----------------------------------------------------------- |
| `resolved-site.type.ts`           | `ResolvedSite`          | `useSite`; the frame, the head and the clients              |
| `site-market.type.ts`             | `SiteMarket`            | the market inside `ResolvedSite`                            |
| `variant.type.ts`                 | `Variant`               | one variant of the generated storefront product view        |
| `variant-choice.type.ts`          | `VariantChoice`         | `useVariantChoice`; the product page and `VariantPicker`    |
| `analytics-consent-state.type.ts` | `AnalyticsConsentState` | `useAnalyticsConsent`; `ConsentBanner`                      |
| `billing-interval-state.type.ts`  | `BillingIntervalState`  | `useBillingInterval`; the pricing table                     |
| `locale-suggestion-state.type.ts` | `LocaleSuggestionState` | `useLocaleSuggestion`; `LocaleSuggestion`                   |
| `call-to-action-link.type.ts`     | `CallToActionLink`      | the hero and banner renderers, the label already translated |
| `feature-card.type.ts`            | `FeatureCard`           | the feature grid renderer, the text already translated      |

A shape that crosses the wire is a schema class in `schemas/` or a producer's class from
`#stackra/clients/<service>`, never a type here. Component props are `<name>.props.ts` beside the
component.
