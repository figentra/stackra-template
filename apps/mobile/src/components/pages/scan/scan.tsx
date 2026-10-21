/**
 * Stackra file contract:
 * Purpose: the scanner page: the platform's camera view, a hint, and the found / not-found /
 *          permission / unavailable states. A found variant replaces the modal with the
 *          create-order sheet.
 * Boundary: composition. `ScannerView` is the port's view component (Expo driver: expo-camera's
 *           CameraView); the page never imports a camera module; `formats` are the port's own
 *           barcode format names. The state machine is the hook beside it.
 * Runtime: react-native
 * Governing contract: ADR 0250, ADR 0253
 */
import { useTranslation } from "@stackra/i18n/react";
import { useNavigate, type RouteComponent } from "@stackra/navigation/native";
import { ScannerView } from "@stackra/platform/react";
import { Alert, Button, Spinner } from "@stackra/ui/native";
import { useEffect } from "react";
import { Text, View } from "react-native";
import { useBarcodeScan } from "#src/components/pages/scan/use-barcode-scan";
import { Glass } from "#src/components/ui/glass";
import type { ScanRoute } from "#src/routes/scan.route";
import { I18n } from "#stackra/i18n";
import { Routes } from "#stackra/routes";

/** The scanner modal. */
export const ScanPage: RouteComponent<typeof ScanRoute> = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state, onBarcode } = useBarcodeScan();

  useEffect(() => {
    if (state.kind !== "found") return;
    // Replace rather than push: the sheet under the modal is the one that asked for the scan.
    navigate.replace(Routes.create_order, { variantId: state.variantId });
  }, [state, navigate]);

  if (state.kind === "unavailable")
    return (
      <View
        className="flex-1 items-center justify-center bg-background px-4"
        testID="scan-unavailable"
      >
        <Alert status="warning">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>{t(I18n.mobile.scan.unavailable)}</Alert.Title>
          </Alert.Content>
        </Alert>
      </View>
    );

  if (state.kind === "permission")
    return (
      <View
        className="flex-1 items-center justify-center gap-4 bg-background px-4"
        testID="scan-permission"
      >
        <Text className="text-center text-ink">{t(I18n.mobile.scan.permission)}</Text>
        <Button onPress={state.request}>{t(I18n.mobile.scan.title)}</Button>
      </View>
    );

  return (
    <View className="flex-1 bg-black" testID="scan-page">
      <ScannerView
        style={{ flex: 1 }}
        formats={["ean13", "ean8", "qr", "code128"]}
        onBarcode={onBarcode}
      />
      <View className="absolute inset-x-4 bottom-12">
        <Glass>
          {state.kind === "looking_up" ? (
            <View className="flex-row items-center gap-3">
              <Spinner size="sm" />
              <Text className="text-ink">{state.barcode}</Text>
            </View>
          ) : state.kind === "not_found" ? (
            <View className="gap-3">
              <Text className="text-ink">{t(I18n.catalogue.refusals.variant_not_found)}</Text>
              <Button size="sm" variant="secondary" onPress={state.reset}>
                {t(I18n.mobile.state.retry)}
              </Button>
            </View>
          ) : (
            <Text className="text-ink">{t(I18n.mobile.scan.hint)}</Text>
          )}
        </Glass>
      </View>
    </View>
  );
};
