/**
 * Stackra file contract:
 * Purpose: what the theme member is: a package holding the acme theme, its rendered stylesheets
 *          and the Acme mark.
 * Boundary: static data that gen reads from the syntax tree without running it. The member key
 *           (`theme`) comes from the package name and the `.` entry from src/core. The package
 *           authors no root module because it says nothing gen cannot derive, so gen writes
 *           `ThemeModule` into the `./node` entry; its key names the `theme::` asset namespace of
 *           the mark.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 12 and 15, as amended by programming model v3.1,
 *                     AGENTS.md), ADR 0295 (decisions 1 and 7), ADR 0302
 */
import { definePackage } from "@stackra/contracts";

/** Read by `stackra gen` and `stackra validate`. */
export default definePackage({});
