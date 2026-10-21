/**
 * Stackra file contract:
 * Purpose: the module manifest: what the package shares with a host. The sink binding, the Explorer
 *          and the drivers are discovered; nothing is listed by hand.
 * Boundary: `@Module({ key, exports })` and nothing else: no forRoot, no ConfigurableModuleBuilder.
 *           Gen reads the `@Driver` registrations, the `@DriverOf` config field and any host
 *           `@Replaces(AccessLogSink)`, and writes the binding into `#stackra/wiring`; `node/`
 *           drivers are lazy-loaded.
 * Runtime: node
 * Governing contract: ADR 0263 (gen writes the wiring)
 */
import { Module } from "@stackra/container";
import { AccessLogService } from "#core/services/access-log.service";

/** Import once in a host's root module; every `@AccessLogged` method is then logged. */
@Module({ key: "access_log", exports: [AccessLogService] })
export class AccessLogModule {}
