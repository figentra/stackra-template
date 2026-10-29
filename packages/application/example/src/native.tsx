/**
 * Stackra file contract:
 * Purpose: the native entry of @figentra/acme-example (`./native`): what the OS mobile template (os/mobile@3) loads
 *          from this package. Its default export registers the package's screens, which Home lists.
 * Boundary: registration only; the screen is `screens/welcome`.
 * Runtime: react-native
 * Governing contract: ADR 0436 (decision 2); ADR 0439 (decision 2).
 */
import type { ComponentType } from "react";

import { WelcomeScreen } from "#src/screens/welcome/welcome-screen";

// shortcut: a hand-written register function until gen writes the package's native entry (STA-339).
/** Adds the example's screens to the mobile app. */
export default function register(app: {
  readonly screen: (screen: { name: string; title: string; component: ComponentType }) => void;
}): void {
  app.screen({ name: "example:welcome", title: "Acme example", component: WelcomeScreen });
}
