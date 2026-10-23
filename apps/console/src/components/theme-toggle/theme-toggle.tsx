/**
 * Stackra file contract:
 * Purpose: the top-bar control that cycles the colour schemes (light, dark, system).
 * Boundary: presentation over `useColorScheme()` from `@stackra/theming/react`; the cycle itself is
 *           `CycleThemeShortcut`, so the button, the key and the desktop menu move the scheme the
 *           same way. The icon shows the resolved scheme, the label the chosen one.
 * Runtime: browser
 * Governing contract: ADR 0080 d4, ADR 0128
 */
import { useTranslation } from "@stackra/i18n/react";
import { useShortcut } from "@stackra/shortcuts/react";
import { ColorScheme } from "@stackra/theming";
import { useColorScheme } from "@stackra/theming/react";
import { Button, Tooltip } from "@stackra/ui";
import { Icon, Icons } from "@stackra/ui/icons";
import { I18n } from "#stackra/i18n";
import { CycleThemeShortcut } from "#src/shortcuts/cycle-theme.shortcut";

/**
 * One button, three states; `aria-label` names the current choice so a screen reader hears what it
 * is on.
 */
export function ThemeToggle() {
  const { t } = useTranslation();
  const { scheme, resolved } = useColorScheme();
  const cycle = useShortcut(CycleThemeShortcut);
  const name = t(I18n.console.theme[scheme]);
  return (
    <Tooltip content={name}>
      <Button
        variant="tertiary"
        size="sm"
        isIconOnly
        aria-label={t(I18n.console.theme.toggle, { scheme: name })}
        onPress={cycle}
      >
        <Icon name={resolved === ColorScheme.Dark ? Icons.Moon : Icons.Sun} aria-hidden />
      </Button>
    </Tooltip>
  );
}
