/**
 * Stackra file contract:
 * Purpose: the scanner page: the platform's camera view, a hint, and the found, not-found,
 *          permission and unavailable states. A found variant replaces the scanner with the
 *          create-order sheet.
 * Boundary: a class component bound to `ScanRoute` by its file name, its props typed
 *           `RouteProps<typeof ScanRoute>`. `ScannerView` is the port's view component (Expo
 *           driver: expo-camera's CameraView); the page never imports a camera module; `formats`
 *           are the port's own barcode format names. The state machine is the hook beside it; the
 *           hand-over to the sheet is an effect on the phase, in render().
 * Runtime: react-native
 * Governing contract: ADR 0294 (decisions 7 and 14, as amended by programming model v3.1,
 *                     AGENTS.md: class components), ADR 0250, ADR 0253
 */
import { useTranslation } from "@stackra/i18n/react";
import { type RouteProps, useNavigate } from "@stackra/navigation/native";
import { ScannerView } from "@stackra/platform/react";
import { Alert, Button, Component, Spinner } from "@stackra/ui/native";
import { useEffect } from "react";
import { Text, View } from "react-native";
import { Glass } from "#src/components/glass";
import type { ScanRoute } from "#src/routes/scan/scan.route";
import { useScan } from "#src/routes/scan/use-scan";
import { I18n } from "#stackra/i18n";
import { Routes } from "#stackra/routes";

/** The scanner screen. */
export class Scan extends Component<RouteProps<typeof ScanRoute>> {
  /** The translator of the active locale. */
  i18n = useTranslation();

  /** Typed navigation by route reference. */
  navigate = useNavigate();

  /** The scanner's phase and the camera callback. */
  scan = useScan();

  /** One view per phase: unavailable, permission, or the camera with its status panel. */
  render() {
    const { t } = this.i18n;
    const { state, onBarcode } = this.scan;
    const navigate = this.navigate;

    useEffect(() => {
      if (state.kind !== "found") return;
      // Replace rather than push: the sheet under the scanner is the one that asked for the scan.
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
              <Alert.Title>{t(I18n.pages.scan.unavailable)}</Alert.Title>
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
          <Text className="text-center text-ink">{t(I18n.pages.scan.permission)}</Text>
          <Button onPress={state.request}>{t(I18n.pages.scan.title)}</Button>
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
                <Text className="text-ink">
                  {t(I18n.catalogue.errors.variant_not_found.message)}
                </Text>
                <Button size="sm" variant="secondary" onPress={state.reset}>
                  {t(I18n.mobile.state.retry)}
                </Button>
              </View>
            ) : (
              <Text className="text-ink">{t(I18n.pages.scan.hint)}</Text>
            )}
          </Glass>
        </View>
      </View>
    );
  }
}
