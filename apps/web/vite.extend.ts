/**
 * Stackra file contract:
 * Purpose: the web member's one Vite hatch: adds a build-info meta tag to the HTML, so a support
 *          screenshot names the build mode it came from.
 * Boundary: add-only, merged after the stackra plugin into the generated `.stackra/vite.config.ts`;
 *           it adds a plugin instance and never sets a key gen owns (targets, budgets, the dev
 *           server), which gen checks. No new dependency: the plugin is an inline object. Listed
 *           in `stackra.manifest.json` `hatches`.
 * Runtime: node
 * Governing contract: ADR 0295 (decision 6: closed code hatches), ADR 0165 (Vite with React Router
 *                     7)
 * Reason: no stackra.config.ts section writes into the HTML head, and the build mode in the page
 *         is what support asks for first.
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
