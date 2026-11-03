/**
 * Stackra file contract:
 * Purpose: the panel shell — header, navigation and the outlet every panel page renders into (Filament-style
 *          resources, pages and widgets declared by modules).
 * Boundary: layout only; the pages come from the route folders.
 * Runtime: browser
 * Governing contract: ADR 0294 (decision 14); ADR 0165 (web client stack).
 */
import { Outlet } from "react-router";

import type { PanelShellProps } from "#src/components/panel-shell/panel-shell.props";

// shortcut: plain elements until @stackra/panel renders the shell from the registry (STA-1947); this repository's
// catalogs carry no @heroui/react, so the scaffold's HeroUI button is left out.
/** Layout route of the panel: header and navigation around the current page. */
export function PanelShell({ title }: PanelShellProps) {
  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr]">
      <header className="flex items-center border-b border-border p-4">
        <div className="flex items-center gap-3">
          <img src="/favicon.svg" alt="" width={24} height={24} />
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>
      </header>
      <div className="grid grid-cols-[14rem_1fr]">
        <nav aria-label="Resources" className="border-e border-border p-4" />
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
