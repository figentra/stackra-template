/**
 * Stackra file contract:
 * Purpose: the renderer of `CtaBannerBlock`, bound by name: a title, a line and one button on an
 *          accent surface.
 * Boundary: presentation only. Text arrives as strings: the document renderer resolves each
 *           `LocalizedText` to the visitor's locale, and the coded landing page passes translated
 *           keys. The button names a route key, so the link lands in the visitor's locale.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 7 and 14), ADR 0110
 */
import { Link } from "@stackra/navigation/react";
import { Button } from "@stackra/ui";
import { Routes, type RouteKey } from "#stackra/routes";

/** Copy and the one action. */
export interface CtaBannerProps {
  /** The section heading, already in the visitor's language. */
  readonly title: string;
  /** One sentence under the heading. */
  readonly body: string;
  /** The button's label and the route it opens. */
  readonly button: { readonly label: string; readonly route: RouteKey };
}

/**
 * Accent background with the foreground token for contrast, so a tenant's accent still passes AA.
 */
export function CtaBanner({ title, body, button }: CtaBannerProps) {
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
