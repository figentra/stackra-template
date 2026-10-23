/**
 * Stackra file contract:
 * Purpose: the Liquid Glass panel, with a plain-surface fallback where the effect is unavailable.
 * Boundary: one presentational class component; no state and no data. The fallback is the HeroUI
 *           surface so Android and older iOS get the same spacing and radius. Whether the effect
 *           exists is a device fact read once per launch, not state.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decision 14, as amended by programming model v3.1, AGENTS.md: class
 *                     components), ADR 0061
 */
import { Component } from "#stackra/ui";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { View } from "react-native";
import type { GlassProps } from "#src/components/glass/glass.props";

const glass = isLiquidGlassAvailable();

/** A Liquid Glass panel on iOS 26+; a plain surface everywhere else (Android, older iOS, tests). */
export class Glass extends Component<GlassProps> {
  /** The glass view when the device draws it, else the surface view. */
  render() {
    if (glass)
      return (
        <GlassView
          glassEffectStyle="regular"
          isInteractive
          style={{ borderRadius: 24, padding: 20 }}
        >
          {this.props.children}
        </GlassView>
      );
    return <View className="rounded-3xl bg-surface p-5">{this.props.children}</View>;
  }
}
