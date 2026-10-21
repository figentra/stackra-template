/**
 * Stackra file contract:
 * Purpose: the right-click menu (desktop only): spellcheck suggestions, the edit roles, then the
 *          items the element under the pointer contributed (a resource row's actions arrive as data
 *          from the renderer).
 * Boundary: a `@Menu` of kind `Context`; contributed items are keys the renderer sends with the
 *           request, main renders them and sends the chosen key back as a bridge event. Role names
 *           are Electron's own values.
 * Runtime: node
 * Governing contract: ADR 0058 (Electron), ADR 0139 (row actions declared by the module)
 */
import { Menu, MenuKind, type MenuBuilder } from "@stackra/navigation";
import { Target } from "@stackra/platform";

/** Right-click menu of the desktop target: spellcheck suggestions, edit roles and element items. */
@Menu({ kind: MenuKind.Context, targets: [Target.Desktop] })
export class ContextMenu {
  /** Spellcheck first, so a misspelt word's fix is one click away. */
  items(m: MenuBuilder) {
    return [
      m.spellcheck(),
      m.role("cut"),
      m.role("copy"),
      m.role("paste"),
      m.role("selectAll"),
      m.separator(),
      m.contributed(),
    ];
  }
}
