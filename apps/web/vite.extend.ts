/**
 * Stackra file contract:
 * Purpose: the web member's one Vite hatch: adds a build-info meta tag to the HTML, so a support
 *          screenshot names the build mode it came from.
 * Boundary: a function file at the member root, merged with `mergeConfig` after the stackra plugin
 *           has run; it may add plugin instances but never re-sets what the plugin owns (targets,
 *           budgets, the dev server). No new dependency: the plugin is an inline object.
 * Runtime: node
 * Governing contract: ADR 0165 (Vite with React Router 7)
 */
import type { ViteExtend } from "@stackra/vite-plugin";

/** Adds a build-info banner to index.html; the stackra plugin has already run. */
export default ((ctx) => ({
  plugins: [
    {
      name: "web:build-info",
      transformIndexHtml: (html) =>
        html.replace("</head>", `<meta name="build" content="${ctx.mode}">\n</head>`),
    },
  ],
})) satisfies ViteExtend;
