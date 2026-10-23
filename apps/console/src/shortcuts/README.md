# src/shortcuts

Shortcut classes (ADR 0245, ADR 0294 decision 23): `extends Shortcut({ keys?, group })` with a `run`
method. A shortcut is the one owner of its key and its behaviour: the keyboard, the palette and the
desktop menus (`menus/`) all run the class, and every key hint is drawn by the shortcuts package
with the platform's modifier (⌘ on Apple devices, Ctrl elsewhere). The key (`console.<stem>`) and
the label (`shortcuts::<stem>.label`) are derived; dependencies arrive through the constructor,
typed by class. A palette entry with no key binding omits `keys`. Navigation entries and action
intents are generated from the manifests, never written here.

| File                               | Class                        | Keys          | Runs                                                   |
| ---------------------------------- | ---------------------------- | ------------- | ------------------------------------------------------ |
| `open-palette.shortcut.ts`         | `OpenPaletteShortcut`        | `mod+k`       | opens the palette (`PaletteStore`)                     |
| `toggle-sidebar.shortcut.ts`       | `ToggleSidebarShortcut`      | `mod+b`       | collapses or expands the sidebar (`UiStore`)           |
| `cycle-theme.shortcut.ts`          | `CycleThemeShortcut`         | `mod+shift+l` | the next colour scheme from `ThemingConfig` `schemes`  |
| `open-pending-changes.shortcut.ts` | `OpenPendingChangesShortcut` | none          | jumps to the settings page's pending changes           |
| `sign-out.shortcut.ts`             | `SignOutShortcut`            | none          | signs out through the BFF; the offline queue is locked |

Gen fails on two shortcuts with the same key. Tests: `__tests__/<name>.shortcut.test.ts` with
`runShortcut` from `@stackra/shortcuts/testing`.
