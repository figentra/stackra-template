/**
 * Stackra file contract:
 * Purpose: the component of `ShellLayout`, bound by name: the sidebar from the generated
 *          navigation, the top bar (palette trigger, realtime indicator, inbox, pending changes,
 *          locale, theme, account), the offline banner and the outlet.
 * Boundary: layout only. Navigation items are data from `#stackra/navigation`, gate-filtered by the
 *           navigation package (permission, entitlement, flag, module), each with its localised
 *           `href` and `isCurrent`; the sidebar's items navigate through the app layout's
 *           `navigate`, so the router changes pages without a reload. The shell owns no business
 *           logic; the session check is `ShellLayout.loader`, so by the time this renders a session
 *           exists. HeroUI Pro's `AppLayout`, `Navbar` and `Sidebar` from `@heroui-pro/react`.
 *           Keyboard shortcuts have one owner each, the Shortcut classes: the layout's own `mod+b`
 *           binding is off, and every key hint is drawn by the shortcuts package with the
 *           platform's modifier (⌘ on Apple devices, Ctrl elsewhere). A class component; layouts
 *           take no props, so it needs no props file; gen compiles it to a function component.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 7 and 14; as amended by programming model v3.1,
 *                     AGENTS.md: class components), ADR 0164 (panel shell), ADR 0214 (gate-filtered
 *                     navigation), ADR 0197 as amended (HeroUI Pro)
 */
import { AppLayout, Navbar, Sidebar } from "@heroui-pro/react";
import { Tone } from "@stackra/contracts";
import { useLocale, useTranslation } from "@stackra/i18n/react";
import { useSession } from "@stackra/identity/react";
import { Link, Outlet, useHref, useNavigate, useNavigation } from "@stackra/navigation/react";
import { PanelShell, useBreadcrumbs } from "@stackra/panel/react";
import { ShortcutKeys, useShortcut } from "@stackra/shortcuts/react";
import { useStore } from "@stackra/state/react";
import { Avatar, Breadcrumbs, Button, Dropdown, Icon } from "@stackra/ui/react";
import { Component } from "#stackra/ui";
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
 * menu all move the same value; the content element carries the density class so the panel's
 * tables inherit it. Breadcrumbs come from the matched routes' titles and the panel's resource
 * labels. The sidebar is an `<aside>`, so the menu sits in a `<nav>` landmark of its own.
 */
export class Shell extends Component {
  /** The translator of the active locale. */
  i18n = useTranslation();

  /** The session; the layout's loader guarantees one. */
  session = useSession();

  /** The router's navigate; the app layout hands it to the sidebar and the top bar's links. */
  navigate = useNavigate();

  /** The writing direction: the sidebar sits on the inline start, the right in Arabic. */
  locale = useLocale();

  /** The settings page's URL in the active locale, for the sidebar footer's link. */
  settingsHref = useHref(Routes.settings);

  /** The generated navigation, gate-filtered for this actor. */
  groups = useNavigation(Navigation);

  /** The matched routes' titles and the panel's resource labels. */
  breadcrumbs = useBreadcrumbs();

  /** Sidebar and density state. */
  ui = useStore(UiStore);

  /** Runs `OpenPaletteShortcut`. */
  openPalette = useShortcut(OpenPaletteShortcut);

  /** Runs `SignOutShortcut`. */
  signOut = useShortcut(SignOutShortcut);

  /** The signed-in user, or `null` while the session refreshes. */
  get actor() {
    return this.session.user ?? null;
  }

  /** The panel shell, the app layout with its top bar and sidebar, the outlet and the palette. */
  render() {
    const { t } = this.i18n;
    const actor = this.actor;
    const ui = this.ui;
    return (
      <PanelShell panel={Panels.TenantAdmin}>
        <AppLayout
          sidebarSide={this.locale.direction === "rtl" ? "right" : "left"}
          sidebarCollapsible="icon"
          sidebarOpen={!ui.sidebarCollapsed}
          onSidebarOpenChange={(open) => ui.setSidebarCollapsed(!open)}
          navigate={(href) => this.navigate(href)}
          toggleShortcut={false}
          navbar={
            <Navbar maxWidth="full" aria-label={t(I18n.console.shell.top_bar)}>
              <Navbar.Header>
                <AppLayout.MenuToggle aria-label={t(I18n.console.shell.menu)} />
                <Sidebar.Trigger aria-label={t(I18n.console.shell.sidebar)} />
                <Navbar.Separator />
                <Breadcrumbs>
                  {this.breadcrumbs.map((crumb) => (
                    <Breadcrumbs.Item key={crumb.to} href={crumb.to}>
                      {t(crumb.label)}
                    </Breadcrumbs.Item>
                  ))}
                </Breadcrumbs>
              </Navbar.Header>
              <Navbar.Content>
                <Navbar.Spacer />
                <Button variant="tertiary" size="sm" onPress={this.openPalette}>
                  <Icon name="search" aria-hidden />
                  {t(I18n.shortcuts.open_palette.label)}
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
                      {t(I18n.pages.settings.title)}
                    </Dropdown.Item>
                    <Dropdown.Item
                      id={SignOutShortcut.name}
                      color={Tone.Danger}
                      onAction={this.signOut}
                    >
                      {t(I18n.shortcuts.sign_out.label)}
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Navbar.Content>
            </Navbar>
          }
          sidebar={
            <>
              <Sidebar>
                <Sidebar.Header>
                  <TenantSwitcher />
                </Sidebar.Header>
                <Sidebar.Main>
                  <nav aria-label={t(I18n.console.shell.navigation)}>
                    <Sidebar.Menu aria-label={t(I18n.console.shell.navigation)}>
                      {this.groups.map((group) => (
                        <Sidebar.MenuSection key={group.group}>
                          <Sidebar.MenuHeader>{t(group.group)}</Sidebar.MenuHeader>
                          {group.items.map((item) => (
                            <Sidebar.MenuItem
                              key={item.label}
                              id={item.label}
                              href={item.href}
                              isCurrent={item.isCurrent}
                              textValue={t(item.label)}
                              tooltip={t(item.label)}
                            >
                              <Sidebar.MenuIcon>
                                <Icon name={item.icon} aria-hidden />
                              </Sidebar.MenuIcon>
                              <Sidebar.MenuItemContent>
                                <Sidebar.MenuLabel>{t(item.label)}</Sidebar.MenuLabel>
                              </Sidebar.MenuItemContent>
                            </Sidebar.MenuItem>
                          ))}
                        </Sidebar.MenuSection>
                      ))}
                    </Sidebar.Menu>
                  </nav>
                </Sidebar.Main>
                <Sidebar.Footer>
                  <Sidebar.Menu aria-label={t(I18n.pages.settings.title)}>
                    <Sidebar.MenuItem
                      id={Routes.settings.name}
                      href={this.settingsHref}
                      textValue={t(I18n.pages.settings.title)}
                      tooltip={t(I18n.pages.settings.title)}
                    >
                      <Sidebar.MenuIcon>
                        <Icon name="settings" aria-hidden />
                      </Sidebar.MenuIcon>
                      <Sidebar.MenuItemContent>
                        <Sidebar.MenuLabel>{t(I18n.pages.settings.title)}</Sidebar.MenuLabel>
                      </Sidebar.MenuItemContent>
                    </Sidebar.MenuItem>
                  </Sidebar.Menu>
                </Sidebar.Footer>
                <Sidebar.Rail />
              </Sidebar>
              <Sidebar.Mobile />
            </>
          }
        >
          <OfflineBanner />
          {/* AppLayout renders the <main> landmark; this is the skip link's target */}
          <div id="main" className={ui.densityClass} tabIndex={-1}>
            <Outlet />
          </div>
        </AppLayout>
        <Palette />
      </PanelShell>
    );
  }
}
