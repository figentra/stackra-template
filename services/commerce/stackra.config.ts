/**
 * Stackra file contract:
 * Purpose: what the commerce member IS: its key, root module, API area, health checks and e2e
 *          seeds. Nothing about where it runs (runway.yaml) or how its packages behave
 *          (src/config/*).
 * Boundary: identity only, read by tooling at build time. Consumed services are not listed: gen
 *           infers them from imports of `#stackra/clients`. Infrastructure needs (database, queues,
 *           crons, buckets) are derived from the module declarations into the manifest. Health
 *           checks live here only; runway tunes thresholds (ADR 0190). `defineService` creates
 *           the member's build-time value; decorators annotate code (ADR 0247).
 * Runtime: node
 * Governing contract: ADR 0249, 0261, 0263, 0158, ADR 0247 (define creates values), ADR 0190
 */
import { MigrationMode, MigrationRunner } from "@stackra/config";
import { defineService } from "@stackra/app";
import { ApiArea } from "@stackra/contracts";

/** Read by `stackra gen`, `stackra dev` and `stackra validate`; the one place the key is typed. */
export default defineService({
  key: "commerce",
  module: "./src/commerce.module.ts",
  area: ApiArea.App,
  /** Dependency checks beyond the derived ones (database, cache, queue, every consumed service). */
  health: { path: "/healthz", checks: ["pricing-provider"] },
  /**
   * Seeder keys `<module>.<name>`, in run order: two products, their stock, the demo members'
   * loyalty accounts (the e2e customer holds 1,000 points), and four orders.
   */
  e2e: { seeds: ["catalogue.demo", "inventory.demo", "loyalty_kit.demo", "orders.demo"] },
  migrations: { mode: MigrationMode.ForwardOnly, runner: MigrationRunner.Auto },
});
