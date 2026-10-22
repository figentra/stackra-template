/**
 * Stackra file contract:
 * Purpose: builds PointsEntry values (the port's DTO, not a row) for driver and matcher tests.
 * Boundary: the generic value factory of @stackra/testing: a DTO has no entity manager, so it is
 *           not a `Factory<Model>`. `at` is the frozen test clock.
 * Runtime: isomorphic
 * Governing contract: ADR 0190 (factories), ADR 0269
 */
import { factory } from "@stackra/testing";
import { EntryKind } from "#core/enums/entry-kind.enum";
import type { PointsEntry } from "#core/interfaces/points-entry.interface";
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
