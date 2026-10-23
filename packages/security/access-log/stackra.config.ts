/**
 * Stackra file contract:
 * Purpose: what the access-log member is: a package that ships the `@AccessLogged` facet, its sink
 *          port and drivers, the retention job and the audit-trail resource.
 * Boundary: static data that gen reads from the syntax tree without running it. The member key
 *           (`access_log`) comes from the package name, the entries from the folders under src/,
 *           and the root module is src/node/access-log.module.ts; the Explorer is found at
 *           src/node/access-log.explorer.ts. A package states nothing gen can derive.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 12 and 15), ADR 0295 (decisions 1 and 7)
 */
import { definePackage } from "@stackra/contracts";

/** Read by `stackra gen` and `stackra validate`. */
export default definePackage({});
