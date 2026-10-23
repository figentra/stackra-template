/**
 * Stackra file contract:
 * Purpose: what the Worker does around the router (the shape is `EdgeOptions`): the windows behind
 *          each data cache profile, the redirect lookup, the HTML 404 log and the streaming
 *          timeout.
 * Boundary: the site's own config class (key `web.edge`); nothing is read from the environment, so
 *           it maps no env. `entry/worker.ts` and `entry.server.tsx` are generated from it, and the
 *           Workers cache driver keys each entry by the query, its input, the site, the locale, the
 *           market and the version, with one origin call per key on concurrent misses. HTML is
 *           never cached: every page response is `private, no-cache`. TLS, WAF and rate limits are
 *           the root runway's `edge` (ADR 0237 layer 1), never here.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md), ADR 0297
 *                     (decision 3), ADR 0237
 */
import { Config } from "@stackra/config";
import { EdgeOptions } from "#src/schemas/edge-options.schema";

/** Edge facts of the site: the data cache profiles and what the Worker does around the router. */
export class EdgeConfig extends Config({ schema: EdgeOptions }) {}
