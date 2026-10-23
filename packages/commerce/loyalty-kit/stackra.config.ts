/**
 * Stackra file contract:
 * Purpose: what the loyalty-kit member is: a package that ships points, tiers and redemption as a
 *          module a host imports.
 * Boundary: static data that gen reads from the syntax tree without running it. The member key
 *           (`loyalty_kit`) comes from the package name, the entries from the folders under src/
 *           (`.` from config and core, `./contracts`, `./node`, `./react`, `./native`,
 *           `./testing`), and the root module is src/node/loyalty-kit.module.ts. A package states
 *           nothing gen can derive; its seeders run in a host's `e2e` list as `loyalty_kit.demo`.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 12 and 15), ADR 0295 (decisions 1 and 7)
 */
import { definePackage } from "@stackra/contracts";

/** Read by `stackra gen` and `stackra validate`. */
export default definePackage({});
