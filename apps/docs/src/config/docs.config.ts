/**
 * Stackra file contract:
 * Purpose: the site configuration of @acme/docs: name, theme, colours, logo and favicon, the tabs and their navigation
 *          groups, the footer, the services whose API reference the site carries, and the Mintlify keys gen does not
 *          own (`raw`). `stackra gen` renders `.stackra/site/docs.json` from it, writes the API reference from each
 *          listed service's committed manifest and the `llms.txt` index; there is no hand-written docs.json.
 * Boundary: data only (field initializers); gen imports the file and reads the fields of the one exported class.
 *           Logo and favicon are paths under `src/assets`; a page is its path under `src/docs` without the extension.
 * Runtime: node (read by gen at build time)
 * Governing contract: Stackra ADR 0002 (2026-10-27 amendment); Stackra ADR 0295 (decisions 3 and 4); Stackra ADR 0039
 *                     (the API reference on Mintlify); stackra-177.
 */
import { DocsConfig } from "@stackra/gen";

/** The Acme Retail docs site. */
export class AcmeDocsConfig extends DocsConfig {
  override readonly name = "Acme Retail";

  override readonly description =
    "How the Acme Retail platform is built on Stackra: the commerce service, its decisions, and its public API.";

  override readonly colors = { primary: "#2F6DF6", light: "#F7F7F5", dark: "#1C1E22" };

  override readonly logo = { light: "logo/light.svg", dark: "logo/dark.svg", href: "/" };

  override readonly favicon = "favicon.svg";

  override readonly navigation = [
    {
      tab: "Guides",
      // oxlint-disable-next-line stackra/no-raw-key-literal -- reason: a Mintlify (Lucide) icon name in docs.json, not a Stackra icon key
      icon: "book-open",
      groups: [
        { group: "Get started", pages: ["index", "quickstart"] },
        {
          group: "How it is built",
          pages: ["guides/programming-model", "guides/add-a-field", "guides/testing"],
        },
        { group: "Using the API", pages: ["api-reference/introduction", "api-reference/events"] },
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

  override readonly footer = { socials: { github: "https://github.com/acme" } };

  /** Gen adds an "API reference" tab with one OpenAPI group per service, from its committed manifest. */
  override readonly apiReference = ["commerce"];

  override readonly raw = {
    fonts: { family: "Geist" },
    appearance: { default: "system" },
    icons: { library: "lucide" },
    search: { prompt: "Search the Acme Retail docs" },
    seo: { indexing: "navigable", metatags: { "og:site_name": "Acme Retail docs" } },
    contextual: { options: ["copy", "view", "chatgpt", "claude"] },
    errors: {
      "404": {
        redirect: false,
        title: "Page not found",
        description: "This page moved or never existed. Try search.",
      },
    },
    redirects: [{ source: "/api", destination: "/api-reference/introduction" }],
  };
}
