/**
 * Stackra file contract:
 * Purpose: the sidebar header control that shows the active tenant and switches between the user's
 *          memberships.
 * Boundary: presentation over `useActiveTenant`. A refused switch (queued offline work) is shown as
 *           a toast with the refusal's i18n key; the component never clears the queue itself.
 * Runtime: browser
 * Governing contract: ADR 0208 (memberships), ADR 0139 (feedback as toasts), ADR 0128
 */
import { Avatar, Dropdown, toast } from "@stackra/ui";
import { useTranslation } from "@stackra/i18n/react";
import { Icon, Icons } from "@stackra/ui/icons";
import { useActiveTenant } from "#src/providers/tenant/use-active-tenant";
import { EmptyView } from "#src/components/empty-view";
import { I18n } from "#stackra/i18n";

/** The switcher: a dropdown of memberships, or the no-tenant empty state for a user with none. */
export function TenantSwitcher() {
  const { t } = useTranslation();
  const { current, memberships, switchTo } = useActiveTenant();

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
        className="flex items-center gap-2 w-full"
      >
        <Avatar name={current.name} size="sm" />
        <span className="truncate text-start">{current.name}</span>
        <Icon name={Icons.ChevronDown} aria-hidden className="ms-auto" />
      </Dropdown.Trigger>
      <Dropdown.Menu
        selectionMode="single"
        selectedKeys={[current.tenantId]}
        onAction={async (key) => {
          const outcome = await switchTo(String(key));
          if (outcome !== true) toast.warning(t(outcome));
        }}
      >
        {memberships.map((m) => (
          <Dropdown.Item
            key={m.tenantId}
            id={m.tenantId}
            textValue={m.name}
            description={t(I18n.console.roles[m.role])}
          >
            {m.name}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}
