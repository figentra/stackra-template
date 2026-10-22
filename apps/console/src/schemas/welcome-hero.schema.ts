/**
 * Stackra file contract:
 * Purpose: the props contract of the `console.welcome_hero` block: what a document may pass,
 *          validated on publish and again on render.
 * Boundary: one schema class. Text arrives as i18n keys, never markup; the call to action names a
 *           route key, never a URL, so a document cannot redirect off the app.
 * Runtime: isomorphic
 * Governing contract: ADR 0110 d6, ADR 0112 (no raw HTML), ADR 0095
 */
import { I18nKey } from "@stackra/i18n";
import { Schema, z } from "@stackra/schema";
import { Routes, type RouteKey } from "#stackra/routes";

/** Heading key, body key and one optional call to action. */
export class WelcomeHeroProps extends Schema(
  z.object({
    titleKey: I18nKey.schema,
    bodyKey: I18nKey.schema,
    action: z
      .object({
        labelKey: I18nKey.schema,
        // read at parse time, not at import: the route tree imports this schema through the welcome
        // document
        route: z.custom<RouteKey>((key) => typeof key === "string" && Object.hasOwn(Routes, key)),
      })
      .optional(),
  }),
) {}
