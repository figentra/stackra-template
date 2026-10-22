/**
 * Stackra file contract:
 * Purpose: the ./testing entry: the fake, the entry factory and the matcher.
 * Boundary: test helpers only; built on @stackra/testing (ADR 0269: domain helpers in the owner's
 *           ./testing). The memory sink is a runtime driver and comes from `.` only, so no symbol
 *           is exported from two entries.
 * Runtime: isomorphic
 * Governing contract: ADR 0126, ADR 0269
 */
export { AccessLogEntryFactory } from "#testing/factories/access-log-entry.factory";
export { FakeAccessLogSink } from "#testing/fakes/fake-access-log-sink.fake";
export {
  toHaveLoggedAccess,
  type LoggedAccessExpectation,
} from "#testing/matchers/to-have-logged-access.matcher";
