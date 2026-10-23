/**
 * Stackra file contract:
 * Purpose: the scanner's state machine over the platform `scanner` port: permission, scanning,
 *          found (variant looked up), not found, unavailable. Used by the scan page, so it sits in
 *          its route folder.
 * Boundary: the port, not expo-camera, so another target gets the same hook with a different driver
 *           (ADR 0250). The lookup is the catalogue query; only its `variant_not_found` refusal
 *           means "not found", any other failure is rethrown to the route's error boundary. Each
 *           lookup sends `BarcodeScanned` (outcome only, behind analytics consent). The page
 *           decides what to do with the variant.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decision 14), ADR 0071, ADR 0250, ADR 0253
 */
import { useAnalytics } from "@stackra/analytics/react";
import { useQueryClient } from "@stackra/clients/react";
import type { PublicId } from "@stackra/contracts";
import { isRefusal } from "@stackra/errors";
import { useCapability } from "@stackra/platform/react";
import { useCallback, useState } from "react";
import { BarcodeScanned } from "#src/analytics/barcode-scanned.analytics-event";
import { Commerce } from "#stackra/clients";

/** The scanner's phases; `found` hands the variant to the page. */
type ScanPhase =
  | { readonly kind: "unavailable" }
  | { readonly kind: "permission"; readonly request: () => Promise<void> }
  | { readonly kind: "scanning" }
  | { readonly kind: "looking_up"; readonly barcode: string }
  | { readonly kind: "found"; readonly variantId: PublicId<"var">; readonly title: string }
  | { readonly kind: "not_found"; readonly barcode: string; readonly reset: () => void };

/** What the scan page renders from and feeds. */
export interface ScanState {
  /** The scanner's current phase. */
  readonly state: ScanPhase;
  /** What the camera view calls with each decoded code. */
  readonly onBarcode: (barcode: string) => void;
}

/** Drives the scanner port and the lookup. */
export function useScan(): ScanState {
  // the route's `capability` asserted a scanner for the target; a simulator is still "unavailable"
  // at run time
  const scanner = useCapability("scanner", { required: true });
  const client = useQueryClient();
  const analytics = useAnalytics();
  const [state, setState] = useState<ScanPhase>(() => initial());

  function initial(): ScanPhase {
    if (!scanner.isAvailable) return { kind: "unavailable" };
    if (scanner.permission === "granted") return { kind: "scanning" };
    return {
      kind: "permission",
      request: async () =>
        setState(
          (await scanner.requestPermission()) === "granted"
            ? { kind: "scanning" }
            : { kind: "unavailable" },
        ),
    };
  }

  const onBarcode = useCallback(
    (barcode: string) => {
      if (state.kind !== "scanning") return; // one lookup at a time; the camera keeps firing
      setState({ kind: "looking_up", barcode });
      void client
        .fetch(Commerce.queries.GetVariantByBarcode, { barcode })
        .then((hit) => {
          analytics.track(BarcodeScanned.create({ found: true }));
          setState({ kind: "found", variantId: hit.variantId, title: hit.title });
        })
        .catch((error: unknown) => {
          if (!isRefusal(error, Commerce.refusals.variant_not_found)) throw error;
          analytics.track(BarcodeScanned.create({ found: false }));
          setState({ kind: "not_found", barcode, reset: () => setState({ kind: "scanning" }) });
        });
    },
    [state.kind, client, analytics],
  );

  return { state, onBarcode };
}
