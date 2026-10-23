/**
 * Stackra file contract:
 * Purpose: `ExpireUnpaidOrdersInput`: how many stale orders one run of
 *          `orders.order.expire_unpaid@1` handles.
 * Boundary: a shape class in schemas/, one declaration per file. The job's `cron.input` is checked
 *           against it by gen (`cron_input_invalid`), so the schedule can never send a bad batch.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 4 and 26, as amended by programming model
 *                     v3.1, AGENTS.md)
 */
import { Int, Schema } from "@stackra/validation";

/** How many stale orders one run handles. */
export class ExpireUnpaidOrdersInput extends Schema {
  /** Orders per run; the next tick takes the rest. */
  @Int({
    min: 1,
    max: 500,
  })
  batchSize = 100;
}
