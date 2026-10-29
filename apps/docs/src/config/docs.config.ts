/**
 * Stackra file contract:
 * Purpose: the site configuration of @acme/docs: name, theme, colours, logo and favicon, the tabs and their navigation
 *          groups, the footer and the Mintlify keys gen does not own (`raw`). `stackra gen` renders
 *          `.stackra/site/docs.json` from it and writes the `llms.txt` index; there is no hand-written docs.json. The
 *          lean starter lists no `apiReference`: its example service has no action yet and no committed manifest.
 * Boundary: data only (field initializers); gen imports the file and reads the fields of the one exported class.
 *           Logo and favicon are paths under `src/assets`; a page is its path under `src/docs` without the extension.
 * Runtime: node
 * Governing contract: Stackra ADR 0002 (2026-10-27 amendment); Stackra ADR 0295 (decisions 3 and 4); Stackra ADR 0039
 *                     (the API reference on Mintlify); stackra-15 (the lean starter); stackra-177.
 */
import { DocsConfig } from "@stackra/gen";

/** The Acme docs site. */
export class AcmeDocsConfig extends DocsConfig {
  /** The site name in the header, the browser tab and the llms.txt index. */
  override readonly name = "Acme";

  /** The site description search engines and the llms.txt index show. */
  override readonly description =
    "How Acme is built on Stackra: the lean starter, its programming model, tests and decisions.";

  /** The brand colours Mintlify themes the site with. */
  override readonly colors = { primary: "#2F6DF6", light: "#F7F7F5", dark: "#1C1E22" };

  /** The light and dark logos under src/assets, linking home. */
  override readonly logo = { light: "logo/light.svg", dark: "logo/dark.svg", href: "/" };

  /** The favicon under src/assets. */
  override readonly favicon = "favicon.svg";

  /** The tabs and their page groups; a page is its path under src/docs. */
  override readonly navigation = [
    {
      tab: "Guides",
      // oxlint-disable-next-line stackra/no-raw-key-literal -- reason: a Mintlify (Lucide) icon name in docs.json, not a Stackra icon key
      icon: "book-open",
      groups: [
        { group: "Get started", pages: ["index", "quickstart"] },
        {
          group: "How it is built",
          pages: ["guides/programming-model", "guides/testing"],
        },
      ],
    },
    {
      tab: "Architecture",
      // oxlint-disable-next-line stackra/no-raw-key-literal -- reason: a Mintlify (Lucide) icon name in docs.json, not a Stackra icon key
      icon: "landmark",
      // `adr/index` first, then every record by number; a new ADR needs no entry here.
      groups: [{ group: "Decisions", pages: [{ folder: "adr" }] }],
    },
  ];

  /** The footer's social links. */
  override readonly footer = { socials: { github: "https://github.com/acme" } };

  /** The Mintlify keys gen does not own, passed through to docs.json. */
  override readonly raw = {
    fonts: { family: "Geist" },
    appearance: { default: "system" },
    icons: { library: "lucide" },
    search: { prompt: "Search the Acme docs" },
    seo: { indexing: "navigable", metatags: { "og:site_name": "Acme docs" } },
    contextual: { options: ["copy", "view", "chatgpt", "claude"] },
    errors: {
      "404": {
        redirect: false,
        title: "Page not found",
        description: "This page moved or never existed. Try search.",
      },
    },
  };
}
