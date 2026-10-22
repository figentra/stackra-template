/**
 * Stackra file contract:
 * Purpose: the React context of the resolved site (tenant, locale, market, brand, indexable, signup
 *          URL) and the component that provides it below the site layout, on the server render and
 *          after hydration alike.
 * Boundary: a context with no behaviour before mount, so no `@Provider` class; its value is what
 *           `SiteLayout.resolve` produced. The folder holds this file and `use-site.ts`, nothing
 *           else.
 * Runtime: isomorphic
 * Governing contract: ADR 0175 (sites by host)
 */
import { createContext, type ReactNode } from "react";
import type { ResolvedSite } from "#src/server/resolve-site.server";

/** The context; `undefined` outside the layout (the root error boundary). */
export const SiteContext = createContext<ResolvedSite | undefined>(undefined);

/** What the generated root passes: the layout's resolved value and the tree. */
export interface SiteContextProviderProps {
  /** The site `SiteLayout.resolve` produced for this request. */
  readonly value: ResolvedSite;
  /** The page subtree that reads the site through `useSite`. */
  readonly children: ReactNode;
}

/** Provides the layout's resolved site to every component below it. */
export function SiteContextProvider({ value, children }: SiteContextProviderProps) {
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}
