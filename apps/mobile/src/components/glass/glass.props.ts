/**
 * Stackra file contract:
 * Purpose: the props of the Liquid Glass panel.
 * Boundary: a type only, beside the component it types; re-exported by the folder's `index.ts`.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decision 14, as amended by programming model v3.1, AGENTS.md: Props
 *                     in their own file)
 */
import type { ReactNode } from "react";

/** Props of `Glass`. */
export interface GlassProps {
  /** The panel's content. */
  readonly children: ReactNode;
}
