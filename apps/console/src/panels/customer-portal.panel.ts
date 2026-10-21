/**
 * Stackra file contract:
 * Purpose: declares the customer-facing panel the console also hosts at `/portal`. It hosts the
 *          customer realm, so gen places here every resource, widget, settings page and document
 *          that targets `Realm.Customer` (the customer's own orders, the loyalty overview).
 * Boundary: a declaration only; the panel package renders its own shell and the server scopes every
 *           query to the customer realm, so nothing here grants access. Packages and services
 *           target realms and never name this panel.
 * Runtime: browser
 * Governing contract: ADR 0164 (panels), ADR 0231 (snake_case machine codes)
 */
import { Realm } from "@stackra/contracts";
import { Panel } from "@stackra/panel";

/** The customer portal, mounted at `/portal`; hosts the customer realm. */
@Panel({ key: "customer_portal", path: "/portal", realms: [Realm.Customer] })
export class CustomerPortalPanel {}
