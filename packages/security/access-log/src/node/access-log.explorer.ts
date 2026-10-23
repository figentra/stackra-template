/**
 * Stackra file contract:
 * Purpose: finds every `@AccessLogged` class at bootstrap through the container's DiscoveryService
 *          and wraps each method the class declares, so every call writes one access record. The
 *          runtime half of what gen reads statically.
 * Boundary: registration only; no global registry at import time. The decorator is its own
 *           metadata key, so the Explorer and gen look up the same thing, and the conformance test
 *           proves they agree. Inherited methods are not wrapped, so a service method that calls
 *           an inherited read logs once. A synchronous method stays synchronous: its record is
 *           written without being awaited, and AccessLogService never throws.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 6 and 15), ADR 0144 (Explorers), ADR 0005 (no
 *                     reflect-metadata)
 */
import type { RequestContext } from "@stackra/actions";
import { type DiscoveryService, Explorer } from "@stackra/container";
import { AccessLogged } from "#core/decorators/access-logged.decorator";
import type { AccessLogService } from "#core/services/access-log.service";

/** A method of a logged instance, as the wrapper calls it. */
type Method = (...args: unknown[]) => unknown;

/** One instance per container; runs once after every binding is constructed. */
export class AccessLogExplorer extends Explorer {
  /**
   * @param discovery - lists the instances whose class carries the facet, with its options.
   * @param log - writes each record and swallows a sink failure.
   * @param request - the running call's id and actor, read when the wrapped method is called.
   */
  constructor(
    private readonly discovery: DiscoveryService,
    private readonly log: AccessLogService,
    private readonly request: RequestContext,
  ) {
    super();
  }

  /**
   * Wraps each declared method so the record is written after the call settles; a thrown call is
   * still recorded, against its arguments only.
   */
  onApplicationBootstrap(): void {
    for (const { instance, className, options } of this.discovery.classesWith(AccessLogged)) {
      const slots = instance as Record<string, Method>;
      for (const [method, declared] of this.declaredMethods(instance)) {
        const original = declared.bind(instance);
        const target = `${className}.${method}`;
        slots[method] = (...args: unknown[]) => {
          const { callId, actor } = this.request.current();
          const write = (values: readonly unknown[]) =>
            this.log.record(callId, actor, target, options, values);
          let result: unknown;
          try {
            result = original(...args);
          } catch (error) {
            void write(args);
            throw error;
          }
          if (!(result instanceof Promise)) {
            void write([...args, result]);
            return result;
          }
          return result.then(
            async (value: unknown) => {
              await write([...args, value]);
              return value;
            },
            async (error: unknown) => {
              await write(args);
              throw error;
            },
          );
        };
      }
    }
  }

  /** What is wrapped, as `<Class>.<method>`; the conformance test compares it with gen's list. */
  targets(): readonly string[] {
    return this.discovery
      .classesWith(AccessLogged)
      .flatMap(({ instance, className }) =>
        this.declaredMethods(instance).map(([method]) => `${className}.${method}`),
      );
  }

  /** The methods the instance's own class declares, in source order; no getter, no constructor. */
  private declaredMethods(instance: object): [name: string, method: Method][] {
    const prototype: object = Object.getPrototypeOf(instance);
    return Object.getOwnPropertyNames(prototype).flatMap((name) => {
      const value: unknown = Object.getOwnPropertyDescriptor(prototype, name)?.value;
      return name !== "constructor" && typeof value === "function"
        ? [[name, value as Method] as [string, Method]]
        : [];
    });
  }
}
