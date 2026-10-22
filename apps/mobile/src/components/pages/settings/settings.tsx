/**
 * Stackra file contract:
 * Purpose: the settings page: language, appearance, notification permission, the inbox and
 *          notification preferences, privacy choices, profile link, sign out, app and update
 *          version.
 * Boundary: composition over the i18n, theming, push, consent and session hooks. No value is
 *           written anywhere but the `Prefs` area or the OS settings. Locale and scheme choices
 *           come from the config classes, read with `useConfig`. Changing the locale to a different
 *           direction asks for a restart.
 * Runtime: react-native
 * Governing contract: ADR 0080, ADR 0180, ADR 0192, ADR 0206
 */
import { useConfig } from "@stackra/config/react";
import { useLocale, useTranslation } from "@stackra/i18n/react";
import { useSession } from "@stackra/identity/react";
import { useNavigate, type RouteComponent } from "@stackra/navigation/native";
import { useColorScheme } from "@stackra/theming/react";
import { Button, ListGroup, Select, Separator, Switch } from "@stackra/ui/native";
import Constants from "expo-constants";
import * as Updates from "expo-updates";
import { SessionStatus } from "@stackra/identity";
import { ConsentSection } from "#src/components/pages/settings/consent-section";
import { Screen } from "#src/components/ui/screen";
import { I18nConfig } from "#src/config/i18n.config";
import { ThemingConfig } from "#src/config/theming.config";
import { usePushPermission } from "#src/providers/push";
import type { SettingsRoute } from "#src/routes/settings.route";
import { I18n } from "#stackra/i18n";
import { Routes } from "#stackra/routes";

/** The settings list. The update id shows which EAS Update is running, for support tickets. */
export const SettingsPage: RouteComponent<typeof SettingsRoute> = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const session = useSession();
  const i18n = useConfig(I18nConfig);
  const theming = useConfig(ThemingConfig);
  const { locale, setLocale } = useLocale();
  const { scheme, setScheme } = useColorScheme();
  const push = usePushPermission();
  const update = Updates.updateId ? ` · ${Updates.updateId.slice(0, 8)}` : "";
  const version = `${Constants.expoConfig?.version ?? "dev"}${update}`;

  return (
    <Screen testID="settings-page">
      <ListGroup>
        <ListGroup.Item>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>{t(I18n.mobile.settings.language)}</ListGroup.ItemTitle>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix>
            <Select
              value={locale}
              onValueChange={(next) => void setLocale(next)}
              items={i18n.locales.map((l) => ({ value: l, label: l.nativeName }))}
              testID="settings-language"
            />
          </ListGroup.ItemSuffix>
        </ListGroup.Item>
        <Separator className="mx-4" />
        <ListGroup.Item>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>{t(I18n.mobile.settings.theme.label)}</ListGroup.ItemTitle>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix>
            <Select
              value={scheme}
              onValueChange={setScheme}
              items={theming.schemes.map((s) => ({ value: s, label: t(s.label) }))}
              testID="settings-theme"
            />
          </ListGroup.ItemSuffix>
        </ListGroup.Item>
        {push ? (
          <>
            <Separator className="mx-4" />
            <ListGroup.Item>
              <ListGroup.ItemContent>
                <ListGroup.ItemTitle>{t(I18n.mobile.settings.notifications)}</ListGroup.ItemTitle>
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
              {t(I18n.mobile.settings.notification_preferences)}
            </ListGroup.ItemTitle>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix />
        </ListGroup.Item>
        <Separator className="mx-4" />
        <ListGroup.Item onPress={() => navigate.to(Routes.inbox)} testID="settings-inbox">
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>{t(I18n.mobile.settings.inbox)}</ListGroup.ItemTitle>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix />
        </ListGroup.Item>
        <Separator className="mx-4" />
        <ListGroup.Item onPress={() => navigate.to(Routes.profile)} testID="settings-profile">
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>{t(I18n.mobile.settings.profile)}</ListGroup.ItemTitle>
            <ListGroup.ItemDescription>
              {session.status === SessionStatus.SignedIn ? session.user.email : ""}
            </ListGroup.ItemDescription>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix />
        </ListGroup.Item>
        <Separator className="mx-4" />
        <ListGroup.Item>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>{t(I18n.mobile.settings.version)}</ListGroup.ItemTitle>
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
        {t(I18n.mobile.settings.sign_out)}
      </Button>
    </Screen>
  );
};
