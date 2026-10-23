/**
 * Stackra file contract:
 * Purpose: the root module of the commerce service: the package modules it hosts.
 * Boundary: the one `imports` list this deployable writes (ADR 0259 d4). Feature modules are found
 *           under src/modules/*; consumed services are inferred from the generated clients the code
 *           injects; platform capabilities (database, cache, queue, search, media, realtime) open
 *           from the drivers their config classes name. Nobody writes a `main.ts`: gen writes
 *           `.stackra/entry/server.ts`, which passes this class and the generated wiring to
 *           `createApp`.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 12 and 16), ADR 0295 (decisions 7 and 9), ADR 0090,
 *                     ADR 0263
 */
import { AccessLogModule } from "@acme/access-log/node";
import { LoyaltyKitModule } from "@acme/loyalty-kit/node";
import { Module } from "@stackra/app";

/** Host overrides of both packages' config live in src/config/*.config.ts. */
export class CommerceModule extends Module({ imports: [LoyaltyKitModule, AccessLogModule] }) {}
