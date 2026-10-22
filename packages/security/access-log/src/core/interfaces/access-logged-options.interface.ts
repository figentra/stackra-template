/**
 * Stackra file contract:
 * Purpose: what `@AccessLogged(...)` takes and stores on a method; read by the Explorer at
 *          bootstrap and by gen at build time.
 * Boundary: a plain interface; the decorator never builds a value. It is generic over the decorated
 *           method's own argument list, so `subjects` is checked against that method and a
 *           mismatched function is a type error.
 * Runtime: isomorphic
 * Governing contract: ADR 0144 (metadata registry)
 */
import type { DataClassification } from "#core/enums/data-classification.enum";

/**
 * The decorator's options.
 * @typeParam A - the decorated method's argument list, inferred at the call site.
 */
export interface AccessLoggedOptions<A extends readonly unknown[] = readonly unknown[]> {
  /** Classification of the data the method exposes. */
  readonly classification: DataClassification;
  /** Extracts the public ids of the records the call touches from the method's arguments. */
  readonly subjects: (...args: A) => readonly string[];
}
