/**
 * Stackra file contract:
 * Purpose: what one logged access looks like: who read what, through which class and method, when.
 * Boundary: a DTO; ids only, never the data that was read (ADR 0134).
 * Runtime: isomorphic
 * Governing contract: ADR 0134 (classification), ADR 0098 (the actor chain)
 */
import type { Actor } from "@stackra/contracts";
import type { DataClassification } from "#core/enums/data-classification.enum";

/** One access to classified data. */
export interface AccessRecord {
  /** Unique per call; the sink's idempotency key. */
  readonly callId: string;
  /** The full actor with its `onBehalfOf` chain. */
  readonly actor: Actor;
  /** `<Class>.<method>` that was called. */
  readonly target: string;
  /** The data classification the method declared. */
  readonly classification: DataClassification;
  /**
   * Public ids of the records touched, as the method's `subjects` function extracted them from its
   * arguments.
   */
  readonly subjects: readonly string[];
  /** When the call started, from the pipeline clock. */
  readonly at: Date;
}
