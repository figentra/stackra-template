/**
 * Stackra file contract:
 * Purpose: the share page, bound to `ShareRoute` by name: the shared text and link with a search of
 *          the product catalogue for that text, and the shared images in the attach-images form.
 * Boundary: presentation over the loader's payload; the attach-images component runs the upload and
 *           the action. The shared text and link are shown as text, never as markup, and the link
 *           is not followed. A class component typed by its route (`RouteProps<typeof
 *           ShareRoute>`), so it needs no props file; gen compiles it to a function component.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 7 and 14; as amended by programming model v3.1,
 *                     AGENTS.md: class components), ADR 0255 (share target)
 */
import { useTranslation } from "@stackra/i18n/react";
import type { RouteProps } from "@stackra/navigation";
import { Link } from "@stackra/navigation/react";
import { Button, Component, Description } from "@stackra/ui";
import { I18n } from "#stackra/i18n";
import { Resources } from "#stackra/resources";
import { AttachImages } from "#src/components/attach-images";
import { EmptyView } from "#src/components/empty-view";
import type { ShareRoute } from "#src/routes/share/share.route";

/** The shared words with a catalogue search, then the shared images. */
export class Share extends Component<RouteProps<typeof ShareRoute>> {
  /** The translator of the active locale. */
  i18n = useTranslation();

  /** The heading and the payload, or the empty state when nothing was shared. */
  render() {
    const { t } = this.i18n;
    const { shared } = this.props.data;
    if (!shared) {
      return (
        <EmptyView
          title={I18n.pages.share.empty_title}
          description={I18n.pages.share.empty_body}
          icon="share-2"
        />
      );
    }
    const words = shared.text ?? shared.title;
    return (
      <div className="flex max-w-2xl flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold">{t(I18n.pages.share.title)}</h1>
          <Description>{t(I18n.pages.share.body)}</Description>
        </header>
        {words && (
          <section aria-label={t(I18n.pages.share.text)} className="flex flex-col gap-2">
            <blockquote className="border-s-2 ps-3">{words}</blockquote>
            <Button
              variant="secondary"
              className="self-start"
              render={<Link to={Resources.Product.list} search={{ search: words }} />}
            >
              {t(I18n.pages.share.search)}
            </Button>
          </section>
        )}
        {shared.url && (
          <section aria-label={t(I18n.pages.share.link)}>
            <code className="break-all text-sm">{shared.url}</code>
          </section>
        )}
        {shared.files.length > 0 && <AttachImages files={shared.files} />}
      </div>
    );
  }
}
