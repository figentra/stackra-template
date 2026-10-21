/**
 * Stackra file contract:
 * Purpose: a LoyaltyMembers fake for hosts' tests: everyone in `ids` is a member; records every
 *          call for assertions.
 * Boundary: built on the generic `Fake` base of @stackra/testing (call recording); the port it
 *           fakes is this package's abstract class, which is why the fake lives here and not in
 *           @stackra/testing (ADR 0269).
 * Runtime: isomorphic
 * Governing contract: ADR 0126 (./testing entry), ADR 0266 decision 2 (a fake per capability), ADR
 *                     0269
 */
import { Fake } from "@stackra/testing";
import { LoyaltyMembers } from "#contracts/loyalty-members.port";
import type { MemberId } from "#core/types/member-id.type";

/**
 * Answers `isMember` from a fixed set; `calls("isMember")` lists what was asked. One runtime export
 * per fake file: the shorthand is the static `with`.
 */
export class FakeLoyaltyMembers extends Fake.of(LoyaltyMembers) {
  /** @param ids - principal public ids treated as enrolled. */
  constructor(private readonly ids: ReadonlySet<string>) {
    super();
  }

  /**
   * Shorthand for `new FakeLoyaltyMembers(new Set(ids))`.
   * @example
   * createTestingModule(LoyaltyKitModule).override(LoyaltyMembers, FakeLoyaltyMembers.with(["usr_1"]))
   */
  static with(ids: readonly string[]): FakeLoyaltyMembers {
    return new FakeLoyaltyMembers(new Set(ids));
  }

  /** Recorded, then answered from `ids`. */
  async isMember(principalId: MemberId): Promise<boolean> {
    this.record("isMember", principalId);
    return this.ids.has(principalId);
  }
}
