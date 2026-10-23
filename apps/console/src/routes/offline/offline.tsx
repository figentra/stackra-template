/**
 * Stackra file contract:
 * Purpose: the offline page, bound to `OfflineRoute` by name and prerendered per locale: the
 *          connection state as it changes, the number of changes waiting on this device, a retry
 *          that reloads the page the user asked for, and what still works without a connection.
 * Boundary: reads only what lives on the device: the locale and direction from `@stackra/i18n`, the
 *           app's `useOnlineStatus` (the platform's network probe), the mutation queue's count. It
 *           never calls a service. The worker served it in place of the requested URL, so a reload
 *           asks for that URL again. Built from HeroUI through `@stackra/ui` and HeroUI Pro's
 *           `EmptyState`, styled by the theme like every other page; the theme's mark is
 *           `PublicLayout`'s. A class component typed by its route (`RouteProps<typeof
 *           OfflineRoute>`), so it needs no props file; gen compiles it to a function component.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 7 and 14; as amended by programming model v3.1,
 *                     AGENTS.md: class components), ADR 0255 (offline page), ADR 0252, ADR 0080
 */
import { EmptyState } from "@heroui-pro/react";
import { Tone } from "@stackra/contracts";
import { useLocale, useTranslation } from "@stackra/i18n/react";
import type { RouteProps } from "@stackra/navigation";
import { useMutationQueue } from "@stackra/query/react";
import { Button, Chip, Icon } from "@stackra/ui/react";
import { Component } from "#stackra/ui";
import { I18n } from "#stackra/i18n";
import { useOnlineStatus } from "#src/hooks/use-online-status";
import type { OfflineRoute } from "#src/routes/offline/offline.route";

/** What still works offline, in the order a till uses it. */
const WORKS = [
  { key: I18n.pages.offline.works.orders, icon: "shopping-cart" },
  { key: I18n.pages.offline.works.recent, icon: "history" },
  { key: I18n.pages.offline.works.catalogue, icon: "search" },
  { key: I18n.pages.offline.works.queue, icon: "cloud-upload" },
  { key: I18n.pages.offline.works.preferences, icon: "sliders-horizontal" },
] as const;

/** The status, the explanation, the retry and the list of what works offline. */
export class Offline extends Component<RouteProps<typeof OfflineRoute>> {
  /** The translator of the active locale. */
  i18n = useTranslation();

  /** The active locale and its writing direction. */
  locale = useLocale();

  /** Whether the last probe reached the API; it flips while the page is open. */
  isOnline = useOnlineStatus();

  /** The offline mutation queue, kept on this device. */
  queue = useMutationQueue();

  /** True from the retry press until the browser replaces the page. */
  isRetrying = false;

  /** Asks the browser for the page the user wanted again. */
  retry() {
    this.isRetrying = true;
    globalThis.location.reload();
  }

  /** The page body, in the locale's direction. */
  render() {
    const { t } = this.i18n;
    const { locale, direction } = this.locale;
    return (
      <section lang={locale} dir={direction} className="flex max-w-md flex-col gap-6">
        <EmptyState>
          <EmptyState.Media variant="icon">
            <Icon name={this.isOnline ? "wifi" : "wifi-off"} aria-hidden />
          </EmptyState.Media>
          <EmptyState.Header>
            <Chip
              role="status"
              size="sm"
              variant="dot"
              color={this.isOnline ? Tone.Success : Tone.Warning}
            >
              {t(
                this.isOnline
                  ? I18n.pages.offline.status_online
                  : I18n.pages.offline.status_offline,
              )}
            </Chip>
            {/* the page's one h1; EmptyState.Title is an h3 for empty regions inside a page */}
            <h1 className="text-lg font-semibold text-foreground">{t(I18n.pages.offline.title)}</h1>
            <EmptyState.Description>{t(I18n.pages.offline.body)}</EmptyState.Description>
            <EmptyState.Description>
              {t(I18n.console.offline.body, { count: this.queue.pending })}
            </EmptyState.Description>
          </EmptyState.Header>
          <EmptyState.Content>
            <Button
              onPress={() => this.retry()}
              isPending={this.isRetrying}
              variant={this.isOnline ? "primary" : "secondary"}
            >
              {t(this.isRetrying ? I18n.pages.offline.retrying : I18n.pages.offline.retry)}
            </Button>
          </EmptyState.Content>
        </EmptyState>
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">{t(I18n.pages.offline.works_title)}</h2>
          <ul className="flex flex-col gap-2">
            {WORKS.map((item) => (
              <li key={item.key} className="flex items-start gap-3">
                <Icon name={item.icon} aria-hidden className="mt-1 shrink-0" />
                <span>{t(item.key)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }
}
