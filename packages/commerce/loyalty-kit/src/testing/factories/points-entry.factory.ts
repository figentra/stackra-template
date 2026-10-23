/**
 * Stackra file contract:
 * Purpose: builds PointsEntry values (the port's DTO, not a row) for driver and matcher tests.
 * Boundary: the generic value factory of @stackra/testing: the port's DTO is not a model, so this
 *           is a plain value, not a `Factory(Model)` kind, and it stays in ./testing. `at` is the
 *           frozen test clock.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decision 15), ADR 0190 (factories), ADR 0269
 */
import { factory } from "@stackra/testing";
import { EntryKind } from "#contracts/enums/entry-kind.enum";
import type { PointsEntry } from "#contracts/types/points-entry.type";
import { memberId } from "#core/functions/member-id.function";

/**
 * `pointsEntry.build({ points: -50 })` overrides any field; `pointsEntry.buildMany(3)` numbers the
 * references.
 */
export const pointsEntry = factory<PointsEntry>({
  memberId: memberId("usr_1"),
  points: 100,
  kind: EntryKind.Earn,
  reference: (i) => `ord_${i}`,
  at: () => new Date(),
});
