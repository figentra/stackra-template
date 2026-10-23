/**
 * Stackra file contract:
 * Purpose: the Liquid Glass panel, with a plain-surface fallback where the effect is unavailable.
 * Boundary: one presentational component; no state and no data. The fallback is the HeroUI surface
 *           so Android and older iOS get the same spacing and radius.
 * Runtime: react-native
 * Governing contract: ADR 0061
 */
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import type { ReactNode } from "react";
import { View } from "react-native";

const glass = isLiquidGlassAvailable();

/** Props of {@link Glass}. */
export interface GlassProps {
  /** The panel's content. */
  readonly children: ReactNode;
}

/** A Liquid Glass panel on iOS 26+; a plain surface everywhere else (Android, older iOS, tests). */
export function Glass({ children }: GlassProps) {
  if (glass)
    return (
      <GlassView glassEffectStyle="regular" isInteractive style={{ borderRadius: 24, padding: 20 }}>
        {children}
      </GlassView>
    );
  return <View className="rounded-3xl bg-surface p-5">{children}</View>;
}
