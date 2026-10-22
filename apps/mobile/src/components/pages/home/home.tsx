/**
 * Stackra file contract:
 * Purpose: the home page: the offline banner, the dashboard widgets services declared for the
 *          hosted panel, quick actions (new order, scan), the tenant's announcements and the inbox.
 * Boundary: a function component; props come from `RouteComponent<typeof HomeRoute>`. The panel's
 *           `WidgetSlot` fetches, gates by permission and entitlement, and refreshes on the
 *           declared events. Navigation targets are route classes; the scan action follows the
 *           quick-order flag like its route.
 * Runtime: react-native
 * Governing contract: ADR 0081, ADR 0110, ADR 0164
 */
import { useFlag } from "@stackra/feature-flags/react";
import { useTranslation } from "@stackra/i18n/react";
import { useNavigate, type RouteComponent } from "@stackra/navigation/native";
import { WidgetSlot } from "@stackra/panel/native";
import { Button, Card } from "@stackra/ui/native";
import { View } from "react-native";
import { OfflineBanner } from "#src/components/ui/offline-banner";
import { Screen } from "#src/components/ui/screen";
import type { HomeRoute } from "#src/routes/home.route";
import { Flags } from "#stackra/flags";
import { I18n } from "#stackra/i18n";
import { Slots } from "#stackra/slots";
import { Routes } from "#stackra/routes";

/** The dashboard. Each quick action is a typed navigation to a route class. */
export const HomePage: RouteComponent<typeof HomeRoute> = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const canScan = useFlag(Flags.orders.quick_order);

  return (
    <Screen testID="home-page">
      <OfflineBanner />
      <WidgetSlot slot={Slots.Dashboard.Header} columns={2} />
      <Card>
        <Card.Header>
          <Card.Title>{t(I18n.mobile.home.quick_actions)}</Card.Title>
        </Card.Header>
        <Card.Body>
          <View className="flex-row gap-3">
            <Button
              className="flex-1"
              onPress={() => navigate.to(Routes.create_order)}
              testID="home-new-order"
            >
              {t(I18n.mobile.home.new_order)}
            </Button>
            {canScan ? (
              <Button
                className="flex-1"
                variant="secondary"
                onPress={() => navigate.to(Routes.scan)}
                testID="home-scan"
              >
                {t(I18n.mobile.home.scan)}
              </Button>
            ) : null}
          </View>
        </Card.Body>
      </Card>
      <Button variant="ghost" onPress={() => navigate.to(Routes.announcements)}>
        {t(I18n.mobile.home.announcements)}
      </Button>
      <Button variant="ghost" onPress={() => navigate.to(Routes.inbox)} testID="home-inbox">
        {t(I18n.mobile.home.inbox)}
      </Button>
    </Screen>
  );
};
