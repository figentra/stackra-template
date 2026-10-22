/**
 * Stackra file contract:
 * Purpose: the signal that tells a parked redemption its host step succeeded, so the debit stays.
 * Boundary: a declaration only. It is sent by ConfirmRedemptionAction and nothing else, so
 *           permission, tenancy and the audit trail apply to every confirmation. A waiting run
 *           resumes only when the signal's data equals the step's `correlate` value (the member
 *           and the reference), so one member never confirms another's redemption. The engine
 *           holds a signal that arrives before the run parks.
 * Runtime: node
 * Governing contract: ADR 0152 decision 1 (`waitFor` parks a run until an event or a signal)
 */
import { Schema, z } from "@stackra/schema";
import { Signal } from "@stackra/workflow";

/** Sent once per confirmed redemption; a repeated send changes nothing. */
@Signal({ name: "redemption.confirmed" })
export class RedemptionConfirmed extends Schema(
  z.object({
    /** The member whose points were debited, taken from the confirming actor, never from input. */
    memberId: z.string(),
    /** The reference the redemption was debited under. */
    reference: z.string(),
  }),
) {}
