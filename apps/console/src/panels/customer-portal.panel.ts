/**
 * Stackra file contract:
 * Purpose: declares the customer-facing panel the console also hosts at `/portal`. It hosts the app
 *          API area, so gen places here every resource, widget, settings page and document whose
 *          area is `ApiArea.App` (the loyalty overview).
 * Boundary: a declaration only; the panel package renders its own shell and the server scopes every
 *           query to the customer realm, so nothing here grants access. Packages and services name
 *           an area and never this panel. The key (`customer_portal`) is derived from the file.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 14, 16 and 20), ADR 0164 (panels), ADR 0082 (API areas)
 */
import { ApiArea } from "@stackra/contracts";
import { Panel } from "@stackra/panel";

/** The customer portal, mounted at `/portal`; hosts the app area. */
export class CustomerPortalPanel extends Panel({
  path: "/portal",
  area: ApiArea.App,
}) {}
