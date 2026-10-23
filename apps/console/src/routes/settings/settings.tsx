/**
 * Stackra file contract:
 * Purpose: the settings page, bound to `SettingsRoute` by name: a device tab (prefs store, applied
 *          by the page's hook), a privacy tab (analytics consent), a tenant tab (posted to the
 *          route's `submit`), a link to the generated notification preferences page, and the
 *          pending-changes section (the queue list itself, the anchor the pending-changes shortcut
 *          jumps to).
 * Boundary: labels, bounds and defaults of the tenant fields come from the generated settings
 *           metadata; tab ids and labels come from SettingsTab, option lists from the enums (labels
 *           are their derived i18n keys) and
 *           `#stackra/i18n` locales, never hand-typed. Field names are paths of the form's schema,
 *           checked by its type. A class component typed by its route (`RouteProps<typeof
 *           SettingsRoute>`), so it needs no props file; gen compiles it to a function component.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 7 and 14; as amended by programming model v3.1,
 *                     AGENTS.md: class components), ADR 0213, ADR 0165 (form adapters)
 */
import { useLocale, useTranslation } from "@stackra/i18n/react";
import type { RouteProps } from "@stackra/navigation";
import { Link, useSubmit } from "@stackra/navigation/react";
import { ColorScheme } from "@stackra/theming";
import { Button, Field, Form, Tabs, useSchemaForm } from "@stackra/ui/react";
import { Component } from "#stackra/ui";
import { Enum } from "@stackra/contracts";
import { I18n, locales } from "#stackra/i18n";
import { Settings as SettingKeys, SettingsPages } from "#stackra/settings";
import { PendingChangesList } from "#src/components/pending-changes-list";
import { Density } from "#src/enums/density.enum";
import { SettingsTab } from "#src/enums/settings-tab.enum";
import type { SettingsRoute } from "#src/routes/settings/settings.route";
import { DevicePrefs } from "#src/schemas/device-prefs.schema";
import { TenantSettings } from "#src/schemas/tenant-settings.schema";
import { useDeviceSettings } from "./use-device-settings";

/** The four tenant keys the tenant tab edits, in display order. */
const TENANT_KEYS = [
  SettingKeys.orders.autoCancelAfterMinutes,
  SettingKeys.orders.customersMayCancel,
  SettingKeys.inventory.lowStockThreshold,
  SettingKeys.inventory.allowBackorders,
];

/** Device, privacy and tenant tabs, the notification preferences link and the pending changes. */
export class Settings extends Component<RouteProps<typeof SettingsRoute>> {
  /** The translator of the active locale. */
  i18n = useTranslation();

  /** The endonym lookup for the language options. */
  locale = useLocale();

  /** Posts the tenant tab to the route's `submit` and carries its field errors back. */
  submit = useSubmit<typeof SettingsRoute>();

  /** Saves the device and privacy tabs and applies them at once. */
  device = useDeviceSettings();

  /** The colour schemes as options, labelled by their translated names. */
  get schemes() {
    return Enum.values(ColorScheme).map((scheme) => ({
      value: scheme,
      label: this.i18n.t(I18n.console.theme[scheme]),
    }));
  }

  /** The shipped locales as options, each labelled in its own language. */
  get languages() {
    return locales.map((code) => ({ value: code, label: this.locale.endonym(code) }));
  }

  /** The densities as options, labelled by their derived enum keys. */
  get densities() {
    return Enum.values(Density).map((density) => ({
      value: density,
      label: this.i18n.t(I18n.enums.density[density]),
    }));
  }

  /** The heading, the tabs and the pending-changes section. */
  render() {
    const { t } = this.i18n;
    const { data } = this.props;
    const { save, canNotify } = this.device;
    const deviceForm = useSchemaForm(DevicePrefs, { defaultValues: data.device });
    const tenantForm = useSchemaForm(TenantSettings, {
      defaultValues: data.tenant?.values,
      serverErrors: this.submit.fieldErrors,
    });
    const provenance = data.tenant?.provenance;
    return (
      <div className="flex max-w-2xl flex-col gap-6">
        <h1 className="text-xl font-semibold">{t(I18n.pages.settings.title)}</h1>
        <Tabs aria-label={t(I18n.pages.settings.tabs)}>
          <Tabs.List>
            <Tabs.Tab id={SettingsTab.Device}>{t(I18n.enums.settings_tab.device)}</Tabs.Tab>
            <Tabs.Tab id={SettingsTab.Privacy}>{t(I18n.enums.settings_tab.privacy)}</Tabs.Tab>
            {data.tenant && (
              <Tabs.Tab id={SettingsTab.Tenant}>{t(I18n.enums.settings_tab.tenant)}</Tabs.Tab>
            )}
          </Tabs.List>
          <Tabs.Panel id={SettingsTab.Device}>
            <Form
              form={deviceForm}
              onSubmit={deviceForm.handleSubmit(save)}
              className="flex flex-col gap-4"
            >
              <Field.Select
                name="scheme"
                label={t(I18n.pages.settings.scheme)}
                options={this.schemes}
              />
              <Field.Select
                name="locale"
                label={t(I18n.pages.settings.locale)}
                options={this.languages}
              />
              <Field.RadioGroup
                name="density"
                label={t(I18n.pages.settings.density)}
                options={this.densities}
              />
              <Field.Switch
                name="localNotifications"
                label={t(I18n.pages.settings.local_notifications)}
                description={t(I18n.pages.settings.local_notifications_hint)}
                isDisabled={!canNotify}
              />
              <Button type="submit">{t(I18n.pages.settings.save)}</Button>
            </Form>
          </Tabs.Panel>
          <Tabs.Panel id={SettingsTab.Privacy}>
            <Form
              form={deviceForm}
              onSubmit={deviceForm.handleSubmit(save)}
              className="flex flex-col gap-4"
            >
              <Field.Switch
                name="analyticsConsent"
                label={t(I18n.pages.settings.analytics_consent)}
                description={t(I18n.pages.settings.analytics_consent_hint)}
              />
              <Field.Switch
                name="crashReplayConsent"
                label={t(I18n.pages.settings.crash_replay_consent)}
                description={t(I18n.pages.settings.crash_replay_consent_hint)}
              />
              <Button type="submit">{t(I18n.pages.settings.save)}</Button>
            </Form>
            <Link to={SettingsPages.messages} className="link mt-4 inline-block">
              {t(I18n.pages.settings.notification_preferences)}
            </Link>
          </Tabs.Panel>
          {data.tenant && provenance && (
            <Tabs.Panel id={SettingsTab.Tenant}>
              <Form form={tenantForm} submit={this.submit} className="flex flex-col gap-4">
                {TENANT_KEYS.map((key) => (
                  <Field.Setting key={key.path} setting={key} provenance={provenance[key.path]} />
                ))}
                <Button type="submit" isPending={this.submit.isPending}>
                  {t(I18n.pages.settings.save)}
                </Button>
              </Form>
            </Tabs.Panel>
          )}
        </Tabs>
        <section id="pending-changes" aria-labelledby="pending-changes-title">
          <h2 id="pending-changes-title" className="text-lg font-semibold">
            {t(I18n.console.queue.title)}
          </h2>
          <PendingChangesList />
        </section>
      </div>
    );
  }
}
