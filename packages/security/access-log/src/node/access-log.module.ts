/**
 * Stackra file contract:
 * Purpose: the root module of the access-log package: what it shares with a host. Everything else
 *          in src/node is discovered from its path and base class.
 * Boundary: the key is the package key (`access_log`), the namespace of every permission, i18n key
 *           and table in the package. No bindings list and no imports: gen discovers the sink
 *           drivers, the Explorer, the purge job and the resource, writes the sink binding into
 *           `#stackra/wiring` from config `sink` (or a host `@Replaces(AccessLogSink)`), and loads
 *           the node driver lazily.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 12, 15 and 16), ADR 0263 (gen writes the wiring)
 */
import { Module } from "@stackra/app";
import { AccessLogService } from "#core/services/access-log.service";

/** Import once in a host's root module; every `@AccessLogged` class is then logged. */
export class AccessLogModule extends Module({ exports: [AccessLogService] }) {}
