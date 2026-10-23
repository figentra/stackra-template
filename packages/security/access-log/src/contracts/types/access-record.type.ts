/**
 * Stackra file contract:
 * Purpose: what one logged access looks like: who read what, through which class and method, when.
 * Boundary: a type in the leaf entry; ids only, never the data that was read (ADR 0134).
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 8 and 15), ADR 0134 (classification), ADR 0098 (the
 *                     actor chain)
 */
import type { Actor } from "@stackra/contracts";
import type { DataClassification } from "#contracts/enums/data-classification.enum";

/** One access to classified data. */
export interface AccessRecord {
  /** Unique per call; the sink's idempotency key. */
  readonly callId: string;

  /** The full actor with its `onBehalfOf` chain. */
  readonly actor: Actor;

  /** `<Class>.<method>` that was called. */
  readonly target: string;

  /** The data classification the class declared. */
  readonly classification: DataClassification;

  /**
   * Public ids of the people whose data the call touched: the principal the call is for, or the
   * named field of the records the call handled.
   */
  readonly subjects: readonly string[];

  /** When the call started, from the pipeline clock. */
  readonly at: Date;
}
