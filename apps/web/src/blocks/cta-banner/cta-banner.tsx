/**
 * Stackra file contract:
 * Purpose: the renderer of `CtaBannerBlock`, bound by name: a title, a line and one button on an
 *          accent surface.
 * Boundary: presentation only. Text arrives as strings: the document renderer resolves each
 *           `LocalizedText` to the visitor's locale, and the coded landing page passes translated
 *           keys. The button names a route key, so the link lands in the visitor's locale.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 7 and 14, as amended by programming model v3.1,
 *                     AGENTS.md: class components), ADR 0110
 */
import { Link } from "@stackra/navigation/react";
import { Button, Component } from "@stackra/ui";
import { Routes } from "#stackra/routes";
import type { CtaBannerProps } from "./cta-banner.props";

/**
 * Accent background with the foreground token for contrast, so a tenant's accent still passes AA.
 */
export class CtaBanner extends Component<CtaBannerProps> {
  /** A labelled section with the heading, the line and the button. */
  render() {
    const { title, body, button } = this.props;
    return (
      <section
        aria-labelledby="cta-title"
        className="my-12 rounded-panel bg-accent px-6 py-12 text-center text-accent-foreground"
      >
        <h2 id="cta-title" className="text-3xl font-semibold tracking-tight">
          {title}
        </h2>
        <p className="mx-auto mt-2 max-w-xl">{body}</p>
        <Button
          className="mt-6"
          variant="secondary"
          size="lg"
          render={<Link to={Routes[button.route]} />}
        >
          {button.label}
        </Button>
      </section>
    );
  }
}
