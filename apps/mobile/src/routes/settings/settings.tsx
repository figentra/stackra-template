/**
 * Stackra file contract:
 * Purpose: the settings page: language, colour scheme, notification permission, the inbox and
 *          notification preferences, privacy choices, profile link, sign out, app and update
 *          version.
 * Boundary: a class component bound to `SettingsRoute` by its file name, its props typed
 *           `RouteProps<typeof SettingsRoute>`; composition over the i18n, theming, push, consent
 *           and session hooks, each a hook field. No value is written anywhere but the `Prefs` area
 *           or the OS settings. Locale and scheme choices come from the config overrides, read with
 *           `useConfig`; their labels are the enums' derived keys. Changing the locale to a
 *           different direction asks for a restart.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decisions 7 and 14, as amended by programming model v3.1,
 *                     AGENTS.md: class components), ADR 0080, ADR 0180, ADR 0192, ADR 0206
 */
import { useConfig } from "@stackra/config/react";
import { Locale } from "@stackra/i18n";
import { useLocale, useTranslation } from "@stackra/i18n/react";
import { SessionStatus } from "@stackra/identity";
import { useSession } from "@stackra/identity/react";
import { type RouteProps, useNavigate } from "@stackra/navigation/native";
import { usePushPermission } from "@stackra/platform/react";
import { useColorScheme } from "@stackra/theming/react";
import { Button, ListGroup, Select, Separator, Switch } from "@stackra/ui/native";
import { Component } from "#stackra/ui";
import { Enum } from "@stackra/contracts";
import Constants from "expo-constants";
import * as Updates from "expo-updates";
import { ConsentSection } from "#src/components/consent-section";
import { Screen } from "#src/components/screen";
import { I18nConfig } from "#src/config/i18n.config";
import { ThemingConfig } from "#src/config/theming.config";
import type { SettingsRoute } from "#src/routes/settings/settings.route";
import { I18n } from "#stackra/i18n";
import { Routes } from "#stackra/routes";

/** The settings list. The update id shows which EAS Update is running, for support tickets. */
export class Settings extends Component<RouteProps<typeof SettingsRoute>> {
  /** The translator of the active locale. */
  i18n = useTranslation();

  /** Typed navigation by route reference. */
  navigate = useNavigate();

  /** The session, for the profile line and sign out. */
  session = useSession();

  /** The locales the binary ships. */
  i18nConfig = useConfig(I18nConfig);

  /** The colour schemes the app offers. */
  theming = useConfig(ThemingConfig);

  /** The active locale and its setter. */
  locale = useLocale();

  /** The active colour scheme and its setter. */
  colorScheme = useColorScheme();

  /** `null` on a target without push, so the switch is not rendered. */
  push = usePushPermission();

  /** The app version, with the running EAS Update's short id when one is applied. */
  get version() {
    const update = Updates.updateId ? ` · ${Updates.updateId.slice(0, 8)}` : "";
    return `${Constants.expoConfig?.version ?? "dev"}${update}`;
  }

  /** The signed-in email for the profile row, empty otherwise. */
  get email() {
    return this.session.status === SessionStatus.SignedIn ? this.session.user.email : "";
  }

  /** The settings list, the privacy section and sign out. */
  render() {
    const { t } = this.i18n;
    const push = this.push;

    return (
      <Screen testID="settings-page">
        <ListGroup>
          <ListGroup.Item>
            <ListGroup.ItemContent>
              <ListGroup.ItemTitle>{t(I18n.pages.settings.language)}</ListGroup.ItemTitle>
            </ListGroup.ItemContent>
            <ListGroup.ItemSuffix>
              <Select
                value={this.locale.locale}
                onValueChange={(next) => void this.locale.setLocale(next)}
                items={this.i18nConfig.locales.map((l) => ({
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
              <ListGroup.ItemTitle>{t(I18n.pages.settings.color_scheme)}</ListGroup.ItemTitle>
            </ListGroup.ItemContent>
            <ListGroup.ItemSuffix>
              <Select
                value={this.colorScheme.scheme}
                onValueChange={this.colorScheme.setScheme}
                items={this.theming.schemes.map((s) => ({
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
                  <ListGroup.ItemTitle>{t(I18n.pages.settings.notifications)}</ListGroup.ItemTitle>
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
            onPress={() => this.navigate.to(Routes.notification_preferences)}
            testID="settings-notification-preferences"
          >
            <ListGroup.ItemContent>
              <ListGroup.ItemTitle>
                {t(I18n.pages.settings.notification_preferences)}
              </ListGroup.ItemTitle>
            </ListGroup.ItemContent>
            <ListGroup.ItemSuffix />
          </ListGroup.Item>
          <Separator className="mx-4" />
          <ListGroup.Item onPress={() => this.navigate.to(Routes.inbox)} testID="settings-inbox">
            <ListGroup.ItemContent>
              <ListGroup.ItemTitle>{t(I18n.pages.settings.inbox)}</ListGroup.ItemTitle>
            </ListGroup.ItemContent>
            <ListGroup.ItemSuffix />
          </ListGroup.Item>
          <Separator className="mx-4" />
          <ListGroup.Item
            onPress={() => this.navigate.to(Routes.profile)}
            testID="settings-profile"
          >
            <ListGroup.ItemContent>
              <ListGroup.ItemTitle>{t(I18n.pages.settings.profile)}</ListGroup.ItemTitle>
              <ListGroup.ItemDescription>{this.email}</ListGroup.ItemDescription>
            </ListGroup.ItemContent>
            <ListGroup.ItemSuffix />
          </ListGroup.Item>
          <Separator className="mx-4" />
          <ListGroup.Item>
            <ListGroup.ItemContent>
              <ListGroup.ItemTitle>{t(I18n.pages.settings.version)}</ListGroup.ItemTitle>
              <ListGroup.ItemDescription>{this.version}</ListGroup.ItemDescription>
            </ListGroup.ItemContent>
          </ListGroup.Item>
        </ListGroup>
        <ConsentSection />
        <Button
          variant="danger-soft"
          onPress={() => void this.session.signOut()}
          testID="settings-sign-out"
        >
          {t(I18n.pages.settings.sign_out)}
        </Button>
      </Screen>
    );
  }
}
