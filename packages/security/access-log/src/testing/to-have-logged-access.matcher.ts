/**
 * Stackra file contract:
 * Purpose: `expect(sink).toHaveLoggedAccess({ target, subjects, actorId })` over the memory sink or
 *          the fake.
 * Boundary: a domain matcher owned by this package (ADR 0269); importing the ./testing entry
 *           registers it. Its argument type, `ToHaveLoggedAccessOptions`, is its own file (one
 *           declaration per file).
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 2, 8 and 15, as amended by programming model v3.1,
 *                     AGENTS.md), ADR 0269
 */
import { createMatcher } from "@stackra/testing";
import type { AccessLogSink } from "#contracts/ports/access-log-sink.port";
import type { AccessRecord } from "#contracts/types/access-record.type";
import type { ToHaveLoggedAccessOptions } from "#testing/to-have-logged-access-options.type";

/** A sink the matcher can read: the memory driver (`records()`) or the fake (`calls("write")`). */
type ReadableSink = AccessLogSink & {
  records?(): readonly AccessRecord[];
  calls?(name: "write"): readonly AccessRecord[];
};

/** Reads `records()` from the memory sink or `calls("write")` from the fake. */
export const toHaveLoggedAccess = createMatcher(
  "toHaveLoggedAccess",
  async (sink: ReadableSink, expected: ToHaveLoggedAccessOptions) => {
    const records = sink.records?.() ?? sink.calls?.("write") ?? [];
    const hit = records.some(
      (r) =>
        r.target === expected.target &&
        (!expected.subjects || expected.subjects.every((s) => r.subjects.includes(s))) &&
        (!expected.actorId || r.actor.id === expected.actorId),
    );
    return {
      pass: hit,
      message: () =>
        `expected an access record matching ${JSON.stringify(expected)} ` +
        `among ${records.length} record(s)`,
    };
  },
);

declare module "@stackra/testing" {
  interface Matchers<R> {
    /** Asserts that one access record matches the expectation. */
    toHaveLoggedAccess(expected: ToHaveLoggedAccessOptions): Promise<R>;
  }
}
