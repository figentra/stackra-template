/**
 * Stackra file contract:
 * Purpose: the cookie banner: one necessary cookie is always on; analytics is off until the visitor
 *          allows it. Shown once the browser has read the stored decision and found none.
 * Boundary: UI over @stackra/consent. It renders nothing on the server and on the first client
 *           paint: the decision lives only in the browser, so shared HTML never carries banner
 *           state. A browser sending Global Privacy Control has refused and never sees it. The
 *           decision's effect on analytics is the package's; the banner never talks to the
 *           analytics driver itself. Equal-weight buttons on purpose: declining is as easy as
 *           accepting. A class component: its hook fields are read-only; gen compiles it to a
 *           function component.
 * Runtime: browser
 * Governing contract: ADR 0294 (decision 14, as amended by programming model v3.1, AGENTS.md: class
 *                     components), ADR 0298 (decisions 1, 2 and 6)
 */
import { useTranslation } from "@stackra/i18n/react";
import { Button, Surface } from "@stackra/ui/react";
import { Component } from "#stackra/ui";
import { I18n } from "#stackra/i18n";
import { useAnalyticsConsent } from "./use-analytics-consent";

/**
 * A non-modal `dialog` region at the end of the page; focus is not trapped, so the page stays
 * usable.
 */
export class ConsentBanner extends Component {
  /** The translator of the visitor's locale. */
  translation = useTranslation();

  /** The analytics category's decision and the ways to change it. */
  consent = useAnalyticsConsent();

  /** Nothing until the stored decision is read, and nothing once the visitor has decided. */
  render() {
    const { t } = this.translation;
    if (!this.consent.isLoaded || this.consent.isDecided) return null;
    return (
      <Surface
        render={
          <section role="dialog" aria-labelledby="consent-title" aria-describedby="consent-body" />
        }
        className={`fixed inset-inline-4 bottom-4 z-20 mx-auto max-w-xl rounded-panel p-4 shadow-lg
          md:inset-inline-auto md:end-6`}
      >
        <h2 id="consent-title" className="font-semibold">
          {t(I18n.web.consent.title)}
        </h2>
        <p id="consent-body" className="mt-1 text-sm text-ink-muted">
          {t(I18n.web.consent.body)}
        </p>
        <div className="mt-4 flex gap-2">
          <Button variant="secondary" onPress={this.consent.decline}>
            {t(I18n.web.consent.decline)}
          </Button>
          <Button variant="secondary" onPress={this.consent.allow}>
            {t(I18n.web.consent.accept)}
          </Button>
        </div>
      </Surface>
    );
  }
}
