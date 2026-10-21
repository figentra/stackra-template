/**
 * Stackra file contract:
 * Purpose: the product-analytics event the scanner sends after each lookup: whether the code
 *          matched a variant.
 * Boundary: an analytics event class: `name` is the one string, at the declaration; the payload
 *           carries no barcode, product or user data, only the outcome. Sent only after
 *           `ConsentCategory.Analytics` is granted.
 * Runtime: react-native
 * Governing contract: ADR 0071, ADR 0184
 */
import { AnalyticsEvent } from "@stackra/analytics";

/** `analytics.track(new BarcodeScanned({ found: true }))` from the scanner hook. */
@AnalyticsEvent({ name: "scan.barcode_scanned" })
export class BarcodeScanned extends AnalyticsEvent<{ readonly found: boolean }> {}
