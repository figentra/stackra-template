/**
 * Stackra file contract:
 * Purpose: the Cmd+K palette: every shortcut the actor may run, grouped, plus a free-text intent
 *          that proposes an action.
 * Boundary: presentation over `usePalette`. HeroUI Pro's `Command` owns filtering, keyboard
 *           navigation and focus; this file owns only what each item says and does. A key hint is
 *           drawn by the shortcuts package, which writes the platform's modifier, never the raw
 *           string. A class component; gen compiles it to a function component.
 * Runtime: browser
 * Governing contract: ADR 0294 (decision 23: palette entries are shortcuts), ADR 0245, ADR 0197
 *                     (HeroUI Pro in our own apps), ADR 0294 (as amended by programming model v3.1,
 *                     AGENTS.md: class components)
 */
import { Command, EmptyState } from "@stackra-pro/ui";
import { Tone } from "@stackra/contracts";
import { Risk } from "@stackra/iam";
import { useTranslation } from "@stackra/i18n/react";
import { ShortcutKeys } from "@stackra/shortcuts/react";
import { Chip, Component, Icon, Kbd } from "@stackra/ui";
import { I18n } from "#stackra/i18n";
import { usePalette } from "./use-palette";

/** The palette dialog; mounted once by the shell, opened by the store. */
export class Palette extends Component {
  /** The translator of the active locale. */
  i18n = useTranslation();

  /** The palette's state, groups and runners. */
  palette = usePalette();

  /** The dialog: input, the intent group, the shortcut groups and the key legend. */
  render() {
    const { t } = this.i18n;
    const { isOpen, setOpen, query, setQuery, groups, intent, run, confirmIntent } = this.palette;
    return (
      <Command>
        <Command.Backdrop isOpen={isOpen} onOpenChange={setOpen}>
          <Command.Container>
            <Command.Dialog aria-label={t(I18n.shortcuts.open_palette.label)}>
              <Command.InputGroup>
                <Command.InputGroup.Prefix>
                  <Icon name="search" aria-hidden />
                </Command.InputGroup.Prefix>
                <Command.InputGroup.Input
                  value={query}
                  onChange={setQuery}
                  placeholder={t(I18n.console.palette.placeholder)}
                />
                <Command.InputGroup.ClearButton aria-label={t(I18n.console.palette.clear)} />
                <Command.InputGroup.Suffix>
                  <Kbd>
                    <Kbd.Abbr keyValue="escape" aria-label={t(I18n.console.palette.escape)} />
                  </Kbd>
                </Command.InputGroup.Suffix>
              </Command.InputGroup>
              <Command.List
                emptyState={
                  <EmptyState>
                    <EmptyState.Header>
                      <EmptyState.Title>{t(I18n.console.palette.no_match)}</EmptyState.Title>
                      <EmptyState.Description>
                        {t(I18n.console.palette.no_match_hint)}
                      </EmptyState.Description>
                    </EmptyState.Header>
                  </EmptyState>
                }
              >
                {intent && (
                  <Command.Group heading={t(I18n.console.palette.group_intent)}>
                    <Command.Item textValue={query} onAction={confirmIntent} forceMount>
                      <Icon name="sparkles" aria-hidden />
                      <span>{t(intent.label)}</span>
                      <Chip
                        size="sm"
                        color={intent.risk === Risk.L3 ? Tone.Danger : Tone.Default}
                        className="ms-auto"
                      >
                        {t(I18n.console.risk[intent.risk])}
                      </Chip>
                    </Command.Item>
                  </Command.Group>
                )}
                {groups.map(({ group, shortcuts }) => (
                  <Command.Group key={group} heading={t(group)}>
                    {shortcuts.map((shortcut) => (
                      <Command.Item
                        key={shortcut.key}
                        textValue={[t(shortcut.label), ...(shortcut.intents ?? [])].join(" ")}
                        onAction={() => run(shortcut)}
                      >
                        <Icon name={shortcut.icon ?? "arrow-right"} aria-hidden />
                        <span>{t(shortcut.label)}</span>
                        {shortcut.keys && <ShortcutKeys keys={shortcut.keys} className="ms-auto" />}
                      </Command.Item>
                    ))}
                  </Command.Group>
                ))}
              </Command.List>
              <Command.Footer>
                <Kbd>
                  <Kbd.Abbr keyValue="up" />
                </Kbd>
                <Kbd>
                  <Kbd.Abbr keyValue="down" />
                </Kbd>
                <span>{t(I18n.console.palette.navigate)}</span>
                <Kbd>
                  <Kbd.Abbr keyValue="enter" />
                </Kbd>
                <span>{t(I18n.console.palette.select)}</span>
              </Command.Footer>
            </Command.Dialog>
          </Command.Container>
        </Command.Backdrop>
      </Command>
    );
  }
}
