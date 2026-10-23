/**
 * Stackra file contract:
 * Purpose: what the brand member is: a package of design tokens, the CSS generated from them and
 *          the product mark.
 * Boundary: static data that gen reads from the syntax tree without running it. The member key
 *           (`brand`) comes from the package name, the entries from the folders under src/
 *           (`.` from core, `./contracts`, `./node`), and the root module is
 *           src/node/brand.module.ts, so a package states nothing gen can derive.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 12 and 15), ADR 0295 (decisions 1 and 7)
 */
import { definePackage } from "@stackra/app";

/** Read by `stackra gen` and `stackra validate`. */
export default definePackage({});
