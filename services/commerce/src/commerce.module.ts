/**
 * Stackra file contract:
 * Purpose: the root of the commerce service: the package modules it hosts.
 * Boundary: wiring only (ADR 0259 d4). Feature modules are found under src/modules/*; consumed
 *           services are inferred from imports of `#stackra/clients`; platform capabilities
 *           (database, cache, queue, search, media, realtime) open from the drivers runway.yaml
 *           names. No `forRoot`: a package's drivers register themselves and its config picks one.
 * Runtime: node
 * Governing contract: ADR 0090, 0263, guides/programming-model.mdx#modules and ADR 0266
 */
import { Module } from "@stackra/container";
import { AccessLogModule } from "@stackra/access-log/node";
import { LoyaltyKitModule } from "@stackra/loyalty-kit/node";

/** Values for both packages live in src/config/*.config.ts; a custom driver is `@Replaces`. */
@Module({ key: "commerce", imports: [LoyaltyKitModule, AccessLogModule] })
export class CommerceModule {}
