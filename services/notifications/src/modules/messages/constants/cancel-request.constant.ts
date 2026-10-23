/**
 * Stackra file contract:
 * Purpose: `CANCEL_REQUEST`: the pattern of an inbound cancel request, "CANCEL" then one commerce
 *          order id.
 * Boundary: a module constant in constants/, one declaration per file. The id prefix comes from
 *           commerce's committed manifest through the generated client (`OrderPublicIdPrefix`), so
 *           a renamed prefix fails the build instead of silently matching nothing.
 * Runtime: node
 * Governing contract: ADR 0294 (decision 13, as amended by programming model v3.1, AGENTS.md),
 *                     ADR 0260
 */
import { OrderPublicIdPrefix } from "#stackra/clients/commerce";

/** Case-insensitive; the first capture group is the order id. */
export const CANCEL_REQUEST = new RegExp(
  `^\\s*CANCEL\\s+(${OrderPublicIdPrefix}_[0-9A-Za-z]{26})\\b`,
  "i",
);
