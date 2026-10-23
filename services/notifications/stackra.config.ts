/**
 * Stackra file contract:
 * Purpose: what the notifications member is: its API area, health checks and migration runner.
 *          Nothing about where it runs (root runway.yaml), what it needs per environment
 *          (runway.yaml beside this file) or how its drivers are chosen (src/config/*).
 * Boundary: static data that gen reads from the syntax tree without running it: enum values and
 *           literals, never a function or an environment read. The member key (`notifications`)
 *           comes from the package name, so it is not written here. There is no authored root
 *           module: it would host no package, so gen writes `NotificationsModule` into
 *           `.stackra/gen/module.ts`. The consumed service (commerce) is inferred from the
 *           generated client the code injects; infrastructure needs (database, queues) are derived
 *           from the module into stackra.manifest.json. Health checks live here; runway tunes their
 *           thresholds.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 12 and 20, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0295 (decisions 1, 4 and 7), ADR 0159, ADR 0190
 */
import { defineService } from "@stackra/app";
import { MigrationRunner } from "@stackra/config";
import { ApiArea } from "@stackra/contracts";

/** Read by `stackra gen`, `stackra dev` and `stackra validate`. */
export default defineService({
  area: ApiArea.App,
  /** The mail provider's reachability, beyond the derived checks (database, queue, commerce). */
  health: {
    path: "/healthz",
    checks: ["mail-provider"],
  },
  /** Migrations are forward only; the runner applies gen's ordered SQL before the code starts. */
  migrations: { runner: MigrationRunner.Auto },
});
