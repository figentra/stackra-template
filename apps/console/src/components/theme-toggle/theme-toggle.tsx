/**
 * Stackra file contract:
 * Purpose: the top-bar control that cycles the colour schemes (light, dark, system).
 * Boundary: presentation over `useColorScheme()` from `@stackra/theming/react`; the cycle itself is
 *           `CycleThemeShortcut`, so the button, the key and the desktop menu move the scheme the
 *           same way. The icon shows the resolved scheme, the label the chosen one. A class
 *           component; gen compiles it to a function component.
 * Runtime: browser
 * Governing contract: ADR 0080 d4, ADR 0128, ADR 0294 (as amended by programming model v3.1,
 *                     AGENTS.md: class components)
 */
import { useTranslation } from "@stackra/i18n/react";
import { useShortcut } from "@stackra/shortcuts/react";
import { ColorScheme } from "@stackra/theming";
import { useColorScheme } from "@stackra/theming/react";
import { Button, Icon, Tooltip } from "@stackra/ui/react";
import { Component } from "#stackra/ui";
import { I18n } from "#stackra/i18n";
import { CycleThemeShortcut } from "#src/shortcuts/cycle-theme.shortcut";

/**
 * One button, three states; `aria-label` names the current choice so a screen reader hears what it
 * is on.
 */
export class ThemeToggle extends Component {
  /** The translator of the active locale. */
  i18n = useTranslation();

  /** The chosen scheme and the one it resolves to. */
  scheme = useColorScheme();

  /** Runs `CycleThemeShortcut`, the one owner of the cycle order. */
  cycle = useShortcut(CycleThemeShortcut);

  /** The chosen scheme's translated name. */
  get name() {
    return this.i18n.t(I18n.console.theme[this.scheme.scheme]);
  }

  /** The icon button with its tooltip. */
  render() {
    return (
      <Tooltip content={this.name}>
        <Button
          variant="tertiary"
          size="sm"
          isIconOnly
          aria-label={this.i18n.t(I18n.console.theme.toggle, { scheme: this.name })}
          onPress={this.cycle}
        >
          <Icon name={this.scheme.resolved === ColorScheme.Dark ? "moon" : "sun"} aria-hidden />
        </Button>
      </Tooltip>
    );
  }
}
