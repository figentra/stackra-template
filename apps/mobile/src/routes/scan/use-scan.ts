/**
 * Stackra file contract:
 * Purpose: the scanner's state machine over the platform `scanner` port: permission, scanning,
 *          found (variant looked up), not found, unavailable. Used by the scan page, so it sits in
 *          its route folder; a hook stays a plain function, and its phase and result types are
 *          `types/scan-phase.type.ts` and `types/scan-state.type.ts`.
 * Boundary: the port, not expo-camera, so another target gets the same hook with a different driver
 *           (ADR 0250). The lookup is the catalogue query; only its `VariantNotFoundError` refusal
 *           means "not found", any other failure is rethrown to the error boundary
 *           @stackra/navigation mounts. Each lookup sends `BarcodeScanned` (outcome only, behind
 *           analytics consent). The page decides what to do with the variant.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decision 14), ADR 0071, ADR 0250, ADR 0253
 */
import { useAnalytics } from "@stackra/analytics/react";
import { useQueryClient } from "@stackra/clients/react";
import { isRefusal } from "@stackra/errors";
import { useCapability } from "@stackra/platform/react";
import { useCallback, useState } from "react";
import { BarcodeScanned } from "#src/analytics/barcode-scanned.analytics-event";
import type { ScanPhase } from "#src/types/scan-phase.type";
import type { ScanState } from "#src/types/scan-state.type";
import { GetVariantByBarcodeQuery, VariantNotFoundError } from "#stackra/clients/commerce";

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
        .fetch(GetVariantByBarcodeQuery, { barcode })
        .then((hit) => {
          analytics.track(BarcodeScanned.create({ found: true }));
          setState({ kind: "found", variantId: hit.variantId, title: hit.title });
        })
        .catch((error: unknown) => {
          if (!isRefusal(error, VariantNotFoundError)) throw error;
          analytics.track(BarcodeScanned.create({ found: false }));
          setState({ kind: "not_found", barcode, reset: () => setState({ kind: "scanning" }) });
        });
    },
    [state.kind, client, analytics],
  );

  return { state, onBarcode };
}
