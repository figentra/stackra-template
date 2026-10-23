/**
 * Stackra file contract:
 * Purpose: the home page: the offline banner, the dashboard widgets services declared for its slot,
 *          quick actions (new order, scan), the tenant's announcements and the inbox.
 * Boundary: a function component bound to `HomeRoute` by its file name. The panel's `WidgetSlot`
 *           fetches, gates by permission and entitlement, renders each widget's built-in display
 *           and refreshes on the declared events. Navigation is by route key; the scan action
 *           follows the quick-order flag like its route.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decisions 7 and 14), ADR 0081, ADR 0110, ADR 0164
 */
import { useFlag } from "@stackra/feature-flags/react";
import { useTranslation } from "@stackra/i18n/react";
import { type RouteComponent, useNavigate } from "@stackra/navigation/native";
import { WidgetSlot } from "@stackra/panel/native";
import { Button, Card } from "@stackra/ui/native";
import { View } from "react-native";
import { OfflineBanner } from "#src/components/offline-banner";
import { Screen } from "#src/components/screen";
import type { HomeRoute } from "#src/routes/home/home.route";
import { Flags } from "#stackra/flags";
import { I18n } from "#stackra/i18n";
import { Routes } from "#stackra/routes";
import { Slots } from "#stackra/slots";

/** The dashboard. Each quick action is a typed navigation to a route key. */
export const Home: RouteComponent<typeof HomeRoute> = () => {
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
