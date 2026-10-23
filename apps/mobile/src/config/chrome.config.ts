/**
 * Stackra file contract:
 * Purpose: the native chrome of the app: the header and the tab bar. The shell reads these fields
 *          while the app runs, and gen copies their start values into the Expo configuration and
 *          the generated navigation tree.
 * Boundary: an override of @stackra/navigation's `ChromeConfig`: `override` members only, each
 *           merging the base value, because a nested object is replaced whole. Colours are tokens
 *           of the `acme` theme, never literals (the tab bar's active tint is the accent token by
 *           default). A route overrides chrome for its own screen with `chrome:` (the tab roots
 *           take the large header, sign-in hides it); the tab bar's items come from the routes that
 *           declare `tab` and `menus/tab-bar.menu.ts`.
 * Runtime: react-native
 * Governing contract: ADR 0295 (decisions 4, 11 and 12), ADR 0294 (decision 19, as amended by
 *                     programming model v3.1, AGENTS.md: Base alias), ADR 0061
 */
import { BackTitle, ChromeConfig as BaseChromeConfig } from "@stackra/navigation";

/** Liquid Glass headers with a minimal back button; a tab bar that shrinks and adapts to iPad. */
export class ChromeConfig extends BaseChromeConfig {
  /** A transparent glass header on iOS 26, no shadow, the back button shows only its arrow. */
  override header = { ...this.header, blur: true, backTitle: BackTitle.Minimal };

  /** iOS 26 shrinks the bar while content scrolls down; on iPad it becomes a sidebar. */
  override tabBar = { ...this.tabBar, minimizeOnScroll: true, sidebarAdaptable: true };
}
