# src/types

Types only, one exported declaration per file (`<name>.type.ts`): what a hook returns, and the
shapes those results use. A hook stays a plain function in its route or component folder
(`use-<name>.ts`), or in `src/hooks/` once two folders import it; its result type sits here so the
hook file holds one declaration and the class that reads it imports the type without importing the
hook's module graph.

| File                               | Type                     | Returned by            | Read by                      |
| ---------------------------------- | ------------------------ | ---------------------- | ---------------------------- |
| `active-tenant-state.type.ts`      | `ActiveTenantState`      | `useActiveTenant`      | `TenantSwitcher`             |
| `device-settings-state.type.ts`    | `DeviceSettingsState`    | `useDeviceSettings`    | the `Settings` page          |
| `notification-inbox-state.type.ts` | `NotificationInboxState` | `useNotificationInbox` | `NotificationInbox`          |
| `palette-state.type.ts`            | `PaletteState`           | `usePalette`           | `Palette`                    |
| `palette-group.type.ts`            | `PaletteGroup`           | `usePalette` (groups)  | `Palette`                    |
| `pending-changes-state.type.ts`    | `PendingChangesState`    | `usePendingChanges`    | `PendingChangesList`         |
| `variant-search-state.type.ts`     | `VariantSearchState`     | `useVariantSearch`     | `QuickOrder`, `AttachImages` |

A shape that crosses the wire is a schema class in `schemas/` or a producer's class from
`#stackra/clients/<service>` (`OrderView`, `InboxMessageView`), never a type here. Component props
are `<name>.props.ts` beside the component, not here.
