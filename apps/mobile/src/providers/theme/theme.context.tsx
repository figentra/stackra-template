/**
 * Stackra file contract:
 * Purpose: the colour scheme (light, dark, system) over the brand tokens, remembered per install,
 *          applied through Uniwind, which the UI kit follows. Named as `theme` in `@App`, so the
 *          generated entry mounts it above the provider list.
 * Boundary: a context component with no behaviour before mount. The tokens are
 *           `@stackra/brand/css/native.css`; the schemes and the default are `ThemingConfig`. Pages
 *           read and set the scheme with `useColorScheme` from @stackra/theming/react, the one hook
 *           every app shares.
 * Runtime: react-native
 * Governing contract: ADR 0056, ADR 0080
 */
import { useConfig } from "@stackra/config/react";
import { ThemingProvider } from "@stackra/theming/native";
import { UiProvider } from "@stackra/ui/native";
import type { ReactNode } from "react";
import { ThemingConfig } from "#src/config/theming.config";

/** The provider takes only the subtree it wraps. */
export interface ThemeContextProviderProps {
  /** The tree that may read `useColorScheme()`. */
  readonly children: ReactNode;
}

/**
 * `ColorScheme.System` follows `Appearance` live; an explicit choice is persisted by the theming
 * package.
 */
export function ThemeContextProvider({ children }: ThemeContextProviderProps) {
  const theming = useConfig(ThemingConfig);
  return (
    <ThemingProvider config={theming}>
      <UiProvider>{children}</UiProvider>
    </ThemingProvider>
  );
}
