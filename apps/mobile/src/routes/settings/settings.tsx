/**
 * Stackra file contract:
 * Purpose: the settings page: language, appearance, notification permission, the inbox and
 *          notification preferences, privacy choices, profile link, sign out, app and update
 *          version.
 * Boundary: a function component bound to `SettingsRoute` by its file name; composition over the
 *           i18n, theming, push, consent and session hooks. No value is written anywhere but the
 *           `Prefs` area or the OS settings. Locale and scheme choices come from the config
 *           overrides, read with `useConfig`; their labels are the enums' derived keys. Changing
 *           the locale to a different direction asks for a restart.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decisions 7 and 14), ADR 0080, ADR 0180, ADR 0192, ADR 0206
 */
import { useConfig } from "@stackra/config/react";
import { Locale } from "@stackra/i18n";
import { useLocale, useTranslation } from "@stackra/i18n/react";
import { SessionStatus } from "@stackra/identity";
import { useSession } from "@stackra/identity/react";
import { type RouteComponent, useNavigate } from "@stackra/navigation/native";
import { usePushPermission } from "@stackra/platform/react";
import { useColorScheme } from "@stackra/theming/react";
import { Button, ListGroup, Select, Separator, Switch } from "@stackra/ui/native";
import { Enum } from "@stackra/validation";
import Constants from "expo-constants";
import * as Updates from "expo-updates";
import { ConsentSection } from "#src/components/consent-section";
import { Screen } from "#src/components/screen";
import { MobileI18nConfig } from "#src/config/i18n.config";
import { MobileThemingConfig } from "#src/config/theming.config";
import type { SettingsRoute } from "#src/routes/settings/settings.route";
import { I18n } from "#stackra/i18n";
import { Routes } from "#stackra/routes";

/** The settings list. The update id shows which EAS Update is running, for support tickets. */
export const Settings: RouteComponent<typeof SettingsRoute> = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const session = useSession();
  const i18n = useConfig(MobileI18nConfig);
  const theming = useConfig(MobileThemingConfig);
  const { locale, setLocale } = useLocale();
  const { scheme, setScheme } = useColorScheme();
  // `null` on a target without push, so the switch is not rendered
  const push = usePushPermission();
  const update = Updates.updateId ? ` · ${Updates.updateId.slice(0, 8)}` : "";
  const version = `${Constants.expoConfig?.version ?? "dev"}${update}`;

  return (
    <Screen testID="settings-page">
      <ListGroup>
        <ListGroup.Item>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>{t(I18n.mobile.app_settings.language)}</ListGroup.ItemTitle>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix>
            <Select
              value={locale}
              onValueChange={(next) => void setLocale(next)}
              items={i18n.locales.map((l) => ({
                value: l,
                label: Enum.meta(Locale, l).nativeName,
              }))}
              testID="settings-language"
            />
          </ListGroup.ItemSuffix>
        </ListGroup.Item>
        <Separator className="mx-4" />
        <ListGroup.Item>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>{t(I18n.mobile.app_settings.theme.label)}</ListGroup.ItemTitle>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix>
            <Select
              value={scheme}
              onValueChange={setScheme}
              items={theming.schemes.map((s) => ({
                value: s,
                label: t(I18n.theming.enums.color_scheme[s]),
              }))}
              testID="settings-theme"
            />
          </ListGroup.ItemSuffix>
        </ListGroup.Item>
        {push ? (
          <>
            <Separator className="mx-4" />
            <ListGroup.Item>
              <ListGroup.ItemContent>
                <ListGroup.ItemTitle>
                  {t(I18n.mobile.app_settings.notifications)}
                </ListGroup.ItemTitle>
              </ListGroup.ItemContent>
              <ListGroup.ItemSuffix>
                <Switch
                  isSelected={push.isGranted}
                  onSelectedChange={(on) => void (on ? push.request() : push.openSettings())}
                  testID="settings-push"
                />
              </ListGroup.ItemSuffix>
            </ListGroup.Item>
          </>
        ) : null}
        <Separator className="mx-4" />
        <ListGroup.Item
          onPress={() => navigate.to(Routes.notification_preferences)}
          testID="settings-notification-preferences"
        >
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>
              {t(I18n.mobile.app_settings.notification_preferences)}
            </ListGroup.ItemTitle>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix />
        </ListGroup.Item>
        <Separator className="mx-4" />
        <ListGroup.Item onPress={() => navigate.to(Routes.inbox)} testID="settings-inbox">
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>{t(I18n.mobile.app_settings.inbox)}</ListGroup.ItemTitle>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix />
        </ListGroup.Item>
        <Separator className="mx-4" />
        <ListGroup.Item onPress={() => navigate.to(Routes.profile)} testID="settings-profile">
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>{t(I18n.mobile.app_settings.profile)}</ListGroup.ItemTitle>
            <ListGroup.ItemDescription>
              {session.status === SessionStatus.SignedIn ? session.user.email : ""}
            </ListGroup.ItemDescription>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix />
        </ListGroup.Item>
        <Separator className="mx-4" />
        <ListGroup.Item>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>{t(I18n.mobile.app_settings.version)}</ListGroup.ItemTitle>
            <ListGroup.ItemDescription>{version}</ListGroup.ItemDescription>
          </ListGroup.ItemContent>
        </ListGroup.Item>
      </ListGroup>
      <ConsentSection />
      <Button
        variant="danger-soft"
        onPress={() => void session.signOut()}
        testID="settings-sign-out"
      >
        {t(I18n.mobile.app_settings.sign_out)}
      </Button>
    </Screen>
  );
};
