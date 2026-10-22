/**
 * Stackra file contract:
 * Purpose: `MarkNotificationReadInput`: which inbox entry to mark read.
 * Boundary: one schema class and its inferred type (ADR 0006). The principal is the actor, never an
 *           input field.
 * Runtime: isomorphic
 * Governing contract: ADR 0095, guides/programming-model.mdx#schemas
 */
import { Schema, z } from "@stackra/schema";

/** The entry by public id (`ntf_…`), taken from the path. */
export class MarkNotificationReadInput extends Schema(z.object({ notificationId: z.string() })) {}
