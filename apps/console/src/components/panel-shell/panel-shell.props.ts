/**
 * Stackra file contract:
 * Purpose: `PanelShellProps`, the props of the panel shell.
 * Boundary: a type only, in its own file (ADR 0305: a component's Props live in `<name>.props.ts`).
 * Runtime: browser
 * Governing contract: ADR 0294 (decision 14); ADR 0305 (one declaration per file).
 */

/** Props of `PanelShell`. */
export interface PanelShellProps {
  /** The panel's name, shown in the header. */
  title: string;
}
