/**
 * Stackra file contract:
 * Purpose: the Cmd+K palette: every command the actor may run, grouped, plus a free-text intent
 *          that proposes an action.
 * Boundary: presentation over `useCommandPalette`. HeroUI Pro's `Command` owns filtering, keyboard
 *           navigation and focus; this file owns only what each item says and does. A shortcut is
 *           drawn by the kbd package, which writes the platform's modifier, never the raw string.
 * Runtime: browser
 * Governing contract: ADR 0245, ADR 0197 (HeroUI Pro in our own apps)
 */
import { Command, EmptyState } from "@stackra-pro/ui";
import { Tone } from "@stackra/contracts";
import { Risk } from "@stackra/iam";
import { useTranslation } from "@stackra/i18n/react";
import { ShortcutKeys } from "@stackra/kbd/react";
import { Chip, Kbd } from "@stackra/ui";
import { Icon, Icons } from "@stackra/ui/icons";
import { I18n } from "#stackra/i18n";
import { useCommandPalette } from "./use-command-palette";

/** The palette dialog; mounted once by the shell, opened by the store. */
export function CommandPalette() {
  const { t } = useTranslation();
  const { isOpen, setOpen, query, setQuery, groups, intent, run, confirmIntent } =
    useCommandPalette();

  return (
    <Command>
      <Command.Backdrop isOpen={isOpen} onOpenChange={setOpen}>
        <Command.Container>
          <Command.Dialog aria-label={t(I18n.console.commands.palette)}>
            <Command.InputGroup>
              <Command.InputGroup.Prefix>
                <Icon name={Icons.Magnifier} aria-hidden />
              </Command.InputGroup.Prefix>
              <Command.InputGroup.Input
                value={query}
                onChange={setQuery}
                placeholder={t(I18n.console.commands.placeholder)}
              />
              <Command.InputGroup.ClearButton aria-label={t(I18n.console.commands.clear)} />
              <Command.InputGroup.Suffix>
                <Kbd>
                  <Kbd.Abbr keyValue="escape" aria-label={t(I18n.console.commands.escape)} />
                </Kbd>
              </Command.InputGroup.Suffix>
            </Command.InputGroup>
            <Command.List
              emptyState={
                <EmptyState>
                  <EmptyState.Header>
                    <EmptyState.Title>{t(I18n.console.commands.no_match)}</EmptyState.Title>
                    <EmptyState.Description>
                      {t(I18n.console.commands.no_match_hint)}
                    </EmptyState.Description>
                  </EmptyState.Header>
                </EmptyState>
              }
            >
              {intent && (
                <Command.Group heading={t(I18n.console.commands.group_intent)}>
                  <Command.Item textValue={query} onAction={confirmIntent} forceMount>
                    <Icon name={Icons.Sparkles} aria-hidden />
                    <span>{t(intent.label)}</span>
                    <Chip
                      size="sm"
                      color={intent.risk === Risk.L3 ? Tone.Danger : Tone.Default}
                      className="ms-auto"
                    >
                      {t(I18n.console.risk[intent.risk.value])}
                    </Chip>
                  </Command.Item>
                </Command.Group>
              )}
              {groups.map(({ group, commands }) => (
                <Command.Group key={group} heading={t(group)}>
                  {commands.map((command) => (
                    <Command.Item
                      key={command.key}
                      textValue={[t(command.label), ...(command.intents ?? [])].join(" ")}
                      onAction={() => run(command)}
                    >
                      <Icon name={command.icon ?? Icons.ArrowRight} aria-hidden />
                      <span>{t(command.label)}</span>
                      {command.shortcut && (
                        <ShortcutKeys shortcut={command.shortcut} className="ms-auto" />
                      )}
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
              <span>{t(I18n.console.commands.navigate)}</span>
              <Kbd>
                <Kbd.Abbr keyValue="enter" />
              </Kbd>
              <span>{t(I18n.console.commands.select)}</span>
            </Command.Footer>
          </Command.Dialog>
        </Command.Container>
      </Command.Backdrop>
    </Command>
  );
}
