/**
 * Stackra file contract:
 * Purpose: what the notifications member IS: key, root module, area, health checks. Where it runs
 *          is runway.yaml.
 * Boundary: identity only, read by tooling at build time. Consumed services (commerce) are inferred
 *           from imports of `#stackra/clients`. Health checks live here only (ADR 0190).
 *           `defineService` creates the member's build-time value; decorators annotate code
 *           (ADR 0247).
 * Runtime: node
 * Governing contract: ADR 0249, 0261, 0263, ADR 0247 (define creates values), ADR 0190
 */
import { MigrationMode, MigrationRunner } from "@stackra/config";
import { defineService } from "@stackra/app";
import { ApiArea } from "@stackra/contracts";

/** Read by `stackra gen`, `stackra dev` and `stackra validate`. */
export default defineService({
  key: "notifications",
  module: "./src/notifications.module.ts",
  area: ApiArea.App,
  /** The mail provider reachability check, beyond the derived ones (database, queue, commerce). */
  health: { path: "/healthz", checks: ["mail-provider"] },
  migrations: { mode: MigrationMode.ForwardOnly, runner: MigrationRunner.Auto },
});
