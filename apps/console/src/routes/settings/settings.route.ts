/**
 * Stackra file contract:
 * Purpose: `/settings`: a device tab (theme, language, density, local notifications) kept in the
 *          prefs store, a privacy tab (analytics consent), and a tenant tab (the settings the
 *          consumed modules declared, with provenance and locks) written through the settings
 *          action, so permission and the revision log apply. Its page is `settings.tsx` beside it.
 * Boundary: the loader is composite (prefs plus, when allowed, tenant values); `submit` writes the
 *           tenant values and maps a locked key to its field. The device and privacy tabs never
 *           reach the server. The user's notification preferences are the generated
 *           `/settings/messages` page. The title reuses the page heading's key.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 14 and 16), ADR 0213 (cascade, locks, revisions), ADR
 *                     0250, ADR 0256 (prefs)
 */
import { Route, type RouteContext } from "@stackra/navigation";
import { SettingScope } from "@stackra/settings";
import { Icons } from "@stackra/ui/icons";
import { validate } from "@stackra/validation";
import { Platform } from "#stackra/clients";
import { I18n } from "#stackra/i18n";
import { ShellLayout } from "#src/routes/shell/shell.layout";
import { DevicePrefs } from "#src/schemas/device-prefs.schema";
import { TenantSettings } from "#src/schemas/tenant-settings.schema";

/** Route `/settings`: device, privacy and tenant settings, plus the pending changes; tab three. */
export class SettingsRoute extends Route({
  path: "/settings",
  layout: ShellLayout,
  title: I18n.console.pages.settings,
  tab: {
    order: 3,
    icon: Icons.Gear,
  },
}) {
  /**
   * Device prefs with defaults; tenant values with provenance (`default`, `platform`, `tenant`,
   * `locked`) for an actor who may manage settings, `null` for anyone else.
   */
  override async loader(ctx: RouteContext<this>) {
    const canManage = ctx.actor.can(Platform.permissions.Settings.manage);
    const [device, tenant] = await Promise.all([
      ctx.prefs.read(DevicePrefs),
      canManage ? ctx.settings.read(TenantSettings, { scope: SettingScope.Tenant }) : null,
    ]);
    return { device, tenant };
  }

  /** Writes the tenant values; a locked key comes back as `settings_locked` on its field. */
  override async submit(ctx: RouteContext<this>) {
    const parsed = validate(TenantSettings, await ctx.formData());
    if (!parsed.success) return ctx.fieldErrors(parsed.error);
    const result = await ctx.action(Platform.actions.SetSettingValues, {
      scope: SettingScope.Tenant,
      values: parsed.data,
    });
    return result.ok ? { saved: true } : ctx.fieldErrors(result.error);
  }
}
