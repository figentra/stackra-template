/**
 * Stackra file contract:
 * Purpose: finds every `@AccessLogged` method at bootstrap through the container's DiscoveryService
 *          and wraps it with the interceptor that writes the record. The runtime half of what gen
 *          reads statically (ADR 0144).
 * Boundary: registration only; no global registry at import time. The decorator is its own metadata
 *           key, so the Explorer and gen look up the same thing. A conformance test proves they
 *           agree.
 * Runtime: node
 * Governing contract: ADR 0144 (Explorers), ADR 0005 (no reflect-metadata)
 */
import type { DiscoveryService } from "@stackra/container";
import { type OnApplicationBootstrap } from "@stackra/container";
import type { RequestContext } from "@stackra/actions";
import { AccessLogged } from "#core/decorators/access-logged.decorator";
import type { AccessLogService } from "#core/services/access-log.service";

/** One instance per container; runs once after every provider is constructed. */
export class AccessLogExplorer implements OnApplicationBootstrap {
  constructor(
    private readonly discovery: DiscoveryService,
    private readonly log: AccessLogService,
    private readonly request: RequestContext,
  ) {}

  /**
   * Wraps each decorated method so the record is written after the call returns (a thrown call is
   * still recorded).
   */
  onApplicationBootstrap(): void {
    for (const { instance, method, options, className } of this.discovery.methodsWith(
      AccessLogged,
    )) {
      const original = instance[method].bind(instance);
      instance[method] = async (...args: readonly unknown[]) => {
        const { callId, actor } = this.request.current();
        try {
          return await original(...args);
        } finally {
          await this.log.record(callId, actor, `${className}.${method}`, options, args);
        }
      };
    }
  }

  /** What was wrapped; the conformance test compares it with gen's discovery. */
  targets(): readonly string[] {
    return this.discovery
      .methodsWith(AccessLogged)
      .map(({ className, method }) => `${className}.${method}`);
  }
}
