/**
 * Stackra file contract:
 * Purpose: what the commerce member is: its API area, health checks, e2e seeders and migration
 *          runner. Nothing about where it runs (root runway.yaml), what it needs per environment
 *          (runway.yaml beside this file) or how its packages behave (src/config/*).
 * Boundary: static data that gen reads from the syntax tree without running it: enum values and
 *           literals, never a function or an environment read. The member key (`commerce`) comes
 *           from the package name and the root module is src/commerce.module.ts, so neither is
 *           written here. Consumed services are inferred from the generated clients the code
 *           injects; infrastructure needs (database, queues, crons, buckets) are derived from the
 *           modules into stackra.manifest.json. Health checks live here; runway tunes their
 *           thresholds.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 12 and 20), ADR 0295 (decisions 1, 4 and 7), ADR 0159,
 *                     ADR 0190
 */
import { defineService } from "@stackra/app";
import { MigrationRunner } from "@stackra/config";
import { ApiArea } from "@stackra/contracts";

/** Read by `stackra gen`, `stackra dev` and `stackra validate`. */
export default defineService({
  area: ApiArea.App,
  /** Dependency checks beyond the derived ones (database, cache, queue, every consumed service). */
  health: {
    path: "/healthz",
    checks: ["pricing-provider"],
  },
  /**
   * Seeder keys `<module>.<profile>`, in run order: two products, their stock, the demo members'
   * loyalty accounts (the e2e customer holds 1,000 points), and four orders.
   */
  e2e: { seeds: ["catalogue.demo", "inventory.demo", "loyalty_kit.demo", "orders.demo"] },
  /** Migrations are forward only; the runner applies gen's ordered SQL before the code starts. */
  migrations: { runner: MigrationRunner.Auto },
});
