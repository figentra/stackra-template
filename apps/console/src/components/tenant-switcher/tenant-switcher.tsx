/**
 * Stackra file contract:
 * Purpose: the sidebar header control that shows the active tenant and switches between the user's
 *          memberships.
 * Boundary: presentation over `useActiveTenant`. A refused switch (queued offline work) is shown as
 *           a toast with the refusal's i18n key; the component never clears the queue itself. A
 *           class component; gen compiles it to a function component.
 * Runtime: browser
 * Governing contract: ADR 0208 (memberships), ADR 0139 (feedback as toasts), ADR 0294 (as amended
 *                     by programming model v3.1, AGENTS.md: class components)
 */
import type { Key } from "react";
import { useTranslation } from "@stackra/i18n/react";
import { Avatar, Component, Dropdown, Icon, toast } from "@stackra/ui";
import { I18n, type I18nKey } from "#stackra/i18n";
import { EmptyView } from "#src/components/empty-view";
import { useActiveTenant } from "./use-active-tenant";

/**
 * Membership role code → label. The identity service sends the role as a plain code, so a role the
 * console does not know yet shows as a member instead of a raw key.
 */
const ROLE_LABELS: Readonly<Record<string, I18nKey>> = {
  admin: I18n.console.roles.admin,
  staff: I18n.console.roles.staff,
  viewer: I18n.console.roles.viewer,
};

/** The switcher: a dropdown of memberships, or the no-tenant empty state for a user with none. */
export class TenantSwitcher extends Component {
  /** The translator of the active locale. */
  i18n = useTranslation();

  /** The active membership, every membership and the guarded switch. */
  tenancy = useActiveTenant();

  /** Switches to the chosen membership; a refusal is said as a toast. */
  async switchTo(key: Key) {
    const outcome = await this.tenancy.switchTo(String(key));
    if (outcome !== true) toast.warning(this.i18n.t(outcome));
  }

  /** The empty state without a tenant, otherwise the dropdown. */
  render() {
    const { t } = this.i18n;
    const { current, memberships } = this.tenancy;
    if (!current) {
      return (
        <EmptyView
          title={I18n.console.tenant.none_title}
          description={I18n.console.tenant.none_body}
          compact
        />
      );
    }
    return (
      <Dropdown>
        <Dropdown.Trigger
          aria-label={t(I18n.console.tenant.switch)}
          className="flex w-full items-center gap-2"
        >
          <Avatar name={current.name} size="sm" />
          <span className="truncate text-start">{current.name}</span>
          <Icon name="chevron-down" aria-hidden className="ms-auto" />
        </Dropdown.Trigger>
        <Dropdown.Menu
          selectionMode="single"
          selectedKeys={[current.tenantId]}
          onAction={(key) => this.switchTo(key)}
        >
          {memberships.map((m) => (
            <Dropdown.Item
              key={m.tenantId}
              id={m.tenantId}
              textValue={m.name}
              description={t(ROLE_LABELS[m.role] ?? I18n.console.roles.member)}
            >
              {m.name}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}
