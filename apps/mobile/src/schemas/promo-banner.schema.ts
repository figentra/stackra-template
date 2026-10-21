/**
 * Stackra file contract:
 * Purpose: the props contract of the `promo-banner` L2 block: headline, body, and one call to
 *          action that is a closed UI verb (navigate to a route of this app) or an action key,
 *          never a URL to arbitrary code.
 * Boundary: validated by the experience service on publish and by the renderer on render;
 *           `blocks/promo-banner` registers it with the component. Strings are tenant-authored
 *           text, already translated per locale by the service. Routes are referenced by their
 *           generated keys (`#stackra/routes`), so a removed route fails gen.
 * Runtime: isomorphic
 * Governing contract: ADR 0110, ADR 0112
 */
import { Schema, z } from "@stackra/schema";
import { routeKeys } from "#stackra/routes";

/** Version 1 of the block's props; a breaking change adds `@Version(2)` on the `@Block` class. */
export class PromoBannerProps extends Schema(
  z.object({
    /** At most 60 characters so it fits one line on a phone. */
    headline: z.string().min(1).max(60),
    /** Optional, at most 200 characters. */
    body: z.string().max(200).optional(),
    /**
     * Label plus a navigate verb to a route of this app, or an action key the renderer dispatches.
     */
    cta: z
      .object({
        label: z.string().min(1).max(24),
        event: z.union([
          z.object({ verb: z.literal("navigate"), route: routeKeys }),
          z.object({ verb: z.literal("action"), key: z.string() }),
        ]),
      })
      .optional(),
  }),
) {}
