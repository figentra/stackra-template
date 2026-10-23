/**
 * Stackra file contract:
 * Purpose: the settings page, bound to `SettingsRoute` by name: a device tab (prefs store, applied
 *          by the page's hook), a privacy tab (analytics consent), a tenant tab (posted to the
 *          route's `submit`), a link to the generated notification preferences page, and the
 *          pending-changes section (the queue list itself, the anchor the pending-changes shortcut
 *          jumps to).
 * Boundary: labels, bounds and defaults of the tenant fields come from the generated settings
 *           metadata; option lists come from the enums (labels are their derived i18n keys) and
 *           `#stackra/i18n` locales, never hand-typed. Field names are paths of the form's schema,
 *           checked by its type.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 7 and 14), ADR 0213, ADR 0165 (form adapters)
 */
import { useLocale, useTranslation } from "@stackra/i18n/react";
import type { RouteComponent } from "@stackra/navigation";
import { Link, useSubmit } from "@stackra/navigation/react";
import { ColorScheme } from "@stackra/theming";
import { Button, Tabs } from "@stackra/ui";
import { Field, Form, useSchemaForm } from "@stackra/ui/form";
import { Enum } from "@stackra/validation";
import { I18n, locales } from "#stackra/i18n";
import { Settings as SettingKeys, SettingsPages } from "#stackra/settings";
import { PendingChangesList } from "#src/components/pending-changes-list";
import { Density } from "#src/enums/density.enum";
import type { SettingsRoute } from "#src/routes/settings/settings.route";
import { DevicePrefs } from "#src/schemas/device-prefs.schema";
import { TenantSettings } from "#src/schemas/tenant-settings.schema";
import { useDeviceSettings } from "./use-device-settings";

/** Tab ids; the tenant tab is absent when the loader returned no tenant values. */
const TAB = { Device: "device", Privacy: "privacy", Tenant: "tenant" } as const;

/** Device, privacy and tenant tabs, the notification preferences link and the pending changes. */
export const Settings: RouteComponent<typeof SettingsRoute> = ({ data }) => {
  const { t } = useTranslation();
  const { endonym } = useLocale();
  const submit = useSubmit<typeof SettingsRoute>();
  const { save, canNotify } = useDeviceSettings();
  const deviceForm = useSchemaForm(DevicePrefs, { defaultValues: data.device });
  const tenantForm = useSchemaForm(TenantSettings, {
    defaultValues: data.tenant?.values,
    serverErrors: submit.fieldErrors,
  });
  const provenance = data.tenant?.provenance;
  const schemes = Enum.values(ColorScheme).map((scheme) => ({
    value: scheme,
    label: t(I18n.console.theme[scheme]),
  }));
  const languages = locales.map((code) => ({ value: code, label: endonym(code) }));
  const densities = Enum.values(Density).map((density) => ({
    value: density,
    label: t(I18n.console.enums.density[density]),
  }));

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <h1 className="text-xl font-semibold">{t(I18n.console.pages.settings)}</h1>
      <Tabs aria-label={t(I18n.console.settings.tabs)}>
        <Tabs.List>
          <Tabs.Tab id={TAB.Device}>{t(I18n.console.settings.device)}</Tabs.Tab>
          <Tabs.Tab id={TAB.Privacy}>{t(I18n.console.settings.privacy)}</Tabs.Tab>
          {data.tenant && <Tabs.Tab id={TAB.Tenant}>{t(I18n.console.settings.tenant)}</Tabs.Tab>}
        </Tabs.List>
        <Tabs.Panel id={TAB.Device}>
          <Form
            form={deviceForm}
            onSubmit={deviceForm.handleSubmit(save)}
            className="flex flex-col gap-4"
          >
            <Field.Select name="scheme" label={t(I18n.console.settings.scheme)} options={schemes} />
            <Field.Select
              name="locale"
              label={t(I18n.console.settings.locale)}
              options={languages}
            />
            <Field.RadioGroup
              name="density"
              label={t(I18n.console.settings.density)}
              options={densities}
            />
            <Field.Switch
              name="localNotifications"
              label={t(I18n.console.settings.local_notifications)}
              description={t(I18n.console.settings.local_notifications_hint)}
              isDisabled={!canNotify}
            />
            <Button type="submit">{t(I18n.console.settings.save)}</Button>
          </Form>
        </Tabs.Panel>
        <Tabs.Panel id={TAB.Privacy}>
          <Form
            form={deviceForm}
            onSubmit={deviceForm.handleSubmit(save)}
            className="flex flex-col gap-4"
          >
            <Field.Switch
              name="analyticsConsent"
              label={t(I18n.console.settings.analytics_consent)}
              description={t(I18n.console.settings.analytics_consent_hint)}
            />
            <Button type="submit">{t(I18n.console.settings.save)}</Button>
          </Form>
          <Link to={SettingsPages.messages} className="link mt-4 inline-block">
            {t(I18n.console.settings.notification_preferences)}
          </Link>
        </Tabs.Panel>
        {data.tenant && provenance && (
          <Tabs.Panel id={TAB.Tenant}>
            <Form form={tenantForm} submit={submit} className="flex flex-col gap-4">
              {[
                SettingKeys.orders.autoCancelAfterMinutes,
                SettingKeys.orders.customersMayCancel,
                SettingKeys.inventory.lowStockThreshold,
                SettingKeys.inventory.allowBackorders,
              ].map((key) => (
                <Field.Setting key={key.path} setting={key} provenance={provenance[key.path]} />
              ))}
              <Button type="submit" isPending={submit.isPending}>
                {t(I18n.console.settings.save)}
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
};
