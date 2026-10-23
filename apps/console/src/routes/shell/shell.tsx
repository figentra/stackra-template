/**
 * Stackra file contract:
 * Purpose: the component of `ShellLayout`, bound by name: the sidebar from the generated
 *          navigation, the top bar (palette trigger, realtime indicator, inbox, pending changes,
 *          locale, theme, account), the offline banner and the outlet.
 * Boundary: layout only. Navigation items are data from `#stackra/navigation`, gate-filtered by the
 *           navigation package (permission, entitlement, flag, module). The shell owns no business
 *           logic; the session check is `ShellLayout.loader`, so by the time this renders a session
 *           exists. HeroUI Pro's `AppLayout` and `Sidebar` because this is our own app (ADR 0197).
 *           Keyboard shortcuts have one owner each, the Shortcut classes: the layout's own `mod+b`
 *           binding is off, and every key hint is drawn by the shortcuts package with the
 *           platform's modifier (⌘ on Apple devices, Ctrl elsewhere).
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 7 and 14), ADR 0164 (panel shell), ADR 0214
 *                     (gate-filtered navigation), ADR 0197 (HeroUI Pro)
 */
import { AppLayout, Navbar, Sidebar } from "@stackra-pro/ui";
import { Tone } from "@stackra/contracts";
import { useTranslation } from "@stackra/i18n/react";
import { useSession } from "@stackra/identity/react";
import { Link, NavLink, Outlet, useNavigate, useNavigation } from "@stackra/navigation/react";
import { PanelShell, useBreadcrumbs } from "@stackra/panel/react";
import { ShortcutKeys, useShortcut } from "@stackra/shortcuts/react";
import { useStore } from "@stackra/state/react";
import { Avatar, Breadcrumbs, Button, Dropdown, Separator } from "@stackra/ui";
import { Icon, Icons } from "@stackra/ui/icons";
import { I18n } from "#stackra/i18n";
import { Navigation } from "#stackra/navigation";
import { Panels } from "#stackra/panels";
import { Routes } from "#stackra/routes";
import { ConnectionIndicator } from "#src/components/connection-indicator";
import { LocaleSwitcher } from "#src/components/locale-switcher";
import { NotificationInbox } from "#src/components/notification-inbox";
import { OfflineBanner } from "#src/components/offline-banner";
import { Palette } from "#src/components/palette";
import { PendingChanges } from "#src/components/pending-changes";
import { TenantSwitcher } from "#src/components/tenant-switcher";
import { ThemeToggle } from "#src/components/theme-toggle";
import { OpenPaletteShortcut } from "#src/shortcuts/open-palette.shortcut";
import { SignOutShortcut } from "#src/shortcuts/sign-out.shortcut";
import { UiStore } from "#src/stores/ui.store";

/**
 * The sidebar state lives in `UiStore` so the keyboard shortcut, the rail button and the desktop
 * menu all move the same value; `main` carries the density class so the panel's tables inherit
 * it. Breadcrumbs come from the matched routes' titles and the panel's resource labels.
 */
export function Shell() {
  const { t } = useTranslation();
  const session = useSession();
  const actor = session.user ?? null;
  const navigate = useNavigate();
  const groups = useNavigation(Navigation);
  const breadcrumbs = useBreadcrumbs();
  const ui = useStore(UiStore);
  const openPalette = useShortcut(OpenPaletteShortcut);
  const signOut = useShortcut(SignOutShortcut);

  return (
    <PanelShell panel={Panels.TenantAdmin}>
      <AppLayout
        sidebarCollapsible="icon"
        sidebarOpen={!ui.sidebarCollapsed}
        onSidebarOpenChange={(open) => ui.setSidebarCollapsed(!open)}
        navigate={(href) => navigate(href)}
        toggleShortcut={false}
        navbar={
          <Navbar maxWidth="full" aria-label={t(I18n.console.shell.top_bar)}>
            <Navbar.Header>
              <AppLayout.MenuToggle aria-label={t(I18n.console.shell.menu)} />
              <Sidebar.Trigger aria-label={t(I18n.console.shell.sidebar)} />
              <Separator orientation="vertical" />
              <Breadcrumbs>
                {breadcrumbs.map((crumb) => (
                  <Breadcrumbs.Item key={crumb.to} href={crumb.to}>
                    {t(crumb.label)}
                  </Breadcrumbs.Item>
                ))}
              </Breadcrumbs>
              <Navbar.Spacer />
              <Button variant="tertiary" size="sm" onPress={openPalette}>
                <Icon name={Icons.Magnifier} aria-hidden />
                {t(I18n.console.shortcuts.open_palette.label)}
                <ShortcutKeys shortcut={OpenPaletteShortcut} />
              </Button>
              <ConnectionIndicator />
              <NotificationInbox />
              <PendingChanges />
              <LocaleSwitcher />
              <ThemeToggle />
              <Dropdown>
                <Dropdown.Trigger aria-label={t(I18n.console.shell.account)}>
                  <Avatar name={actor?.displayName} src={actor?.avatarUrl} size="sm" />
                </Dropdown.Trigger>
                <Dropdown.Menu>
                  <Dropdown.Item id={Routes.settings.name} render={<Link to={Routes.settings} />}>
                    {t(I18n.console.pages.settings)}
                  </Dropdown.Item>
                  <Dropdown.Item id={SignOutShortcut.name} color={Tone.Danger} onAction={signOut}>
                    {t(I18n.console.shortcuts.sign_out.label)}
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Navbar.Header>
          </Navbar>
        }
        sidebar={
          <>
            <Sidebar aria-label={t(I18n.console.shell.navigation)}>
              <Sidebar.Header>
                <TenantSwitcher />
              </Sidebar.Header>
              <Sidebar.Main>
                <Sidebar.Menu>
                  {groups.map((group) => (
                    <Sidebar.MenuSection key={group.group} title={t(group.group)}>
                      {group.items.map((item) => (
                        <Sidebar.MenuItem key={item.label} textValue={t(item.label)}>
                          <NavLink to={item.to}>
                            <Sidebar.MenuIcon>
                              <Icon name={item.icon} aria-hidden />
                            </Sidebar.MenuIcon>
                            <Sidebar.MenuItemContent>
                              <Sidebar.MenuLabel>{t(item.label)}</Sidebar.MenuLabel>
                            </Sidebar.MenuItemContent>
                          </NavLink>
                        </Sidebar.MenuItem>
                      ))}
                    </Sidebar.MenuSection>
                  ))}
                </Sidebar.Menu>
              </Sidebar.Main>
              <Sidebar.Footer>
                <Sidebar.MenuItem textValue={t(I18n.console.pages.settings)}>
                  <NavLink to={Routes.settings}>
                    <Sidebar.MenuIcon>
                      <Icon name={Icons.Gear} aria-hidden />
                    </Sidebar.MenuIcon>
                    <Sidebar.MenuLabel>{t(I18n.console.pages.settings)}</Sidebar.MenuLabel>
                  </NavLink>
                </Sidebar.MenuItem>
              </Sidebar.Footer>
              <Sidebar.Rail />
            </Sidebar>
            <Sidebar.Mobile />
          </>
        }
      >
        <OfflineBanner />
        <main id="main" className={ui.densityClass} tabIndex={-1}>
          <Outlet />
        </main>
      </AppLayout>
      <Palette />
    </PanelShell>
  );
}
