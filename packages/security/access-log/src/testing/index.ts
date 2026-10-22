/**
 * Stackra file contract:
 * Purpose: the ./testing entry: memory sink, the fake, the entry factory and the matcher.
 * Boundary: test helpers only; built on @stackra/testing (ADR 0269: domain helpers in the owner's
 *           ./testing).
 * Runtime: isomorphic
 * Governing contract: ADR 0126, ADR 0269
 */
export { MemoryAccessLogSink } from "#core/drivers/memory-access-log-sink.driver";
export { AccessLogEntryFactory } from "#testing/factories/access-log-entry.factory";
export { FakeAccessLogSink } from "#testing/fakes/fake-access-log-sink.fake";
export {
  toHaveLoggedAccess,
  type LoggedAccessExpectation,
} from "#testing/matchers/to-have-logged-access.matcher";
