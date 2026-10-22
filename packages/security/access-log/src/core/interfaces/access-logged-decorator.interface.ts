/**
 * Stackra file contract:
 * Purpose: the call signature of `@AccessLogged`: generic over the decorated method's argument
 *          list, so the method a decorator marks must accept exactly the arguments its `subjects`
 *          function reads.
 * Boundary: a type only; the runtime decorator is the one `createDecorator` returns, which is its
 *           own metadata key.
 * Runtime: isomorphic
 * Governing contract: ADR 0144 (metadata registry), ADR 0117 C2
 */
import type { AccessLoggedOptions } from "#core/interfaces/access-logged-options.interface";

/**
 * `@AccessLogged({ … })` on a method whose parameters are `A`; a method with other parameters is a
 * type error.
 */
export interface AccessLoggedDecorator {
  <A extends readonly unknown[]>(
    options: AccessLoggedOptions<A>,
  ): (
    target: object,
    key: string | symbol,
    descriptor: TypedPropertyDescriptor<(...args: A) => unknown>,
  ) => void;
}
