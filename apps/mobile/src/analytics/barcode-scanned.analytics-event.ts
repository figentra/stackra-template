/**
 * Stackra file contract:
 * Purpose: the product-analytics event the scanner sends after each lookup: whether the code
 *          matched a variant.
 * Boundary: an analytics event: `name` is the one string, at the declaration; the payload carries
 *           no barcode, product or user data, only the outcome. Sent only once
 *           `ConsentCategory.Analytics` is granted; fired earlier, it waits in the package's
 *           bounded queue and is dropped on refusal.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decisions 5 and 16), ADR 0298 (decision 5), ADR 0071, ADR 0184
 */
import { AnalyticsEvent } from "@stackra/analytics";

/** `analytics.track(BarcodeScanned.create({ found: true }))` from the scanner hook. */
export class BarcodeScanned extends AnalyticsEvent({ name: "scan.barcode_scanned" }) {
  /** Whether the scanned code matched a catalogue variant. */
  found!: boolean;
}
