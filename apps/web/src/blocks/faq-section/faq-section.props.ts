/**
 * Stackra file contract:
 * Purpose: the Props of `FaqSection`: the block's heading plus the output of the query it accepts.
 * Boundary: a type only; the output type is the content client's, never redeclared.
 * Runtime: browser
 * Governing contract: ADR 0294 (as amended by programming model v3.1, AGENTS.md: Props in
 *                     `<name>.props.ts`), ADR 0110 (a block's `accepts`)
 */
import type { QueryOutput } from "@stackra/clients";
import type { ListEntriesQuery } from "#stackra/clients/content";

/** Block props plus the bound query's output. */
export interface FaqSectionProps {
  /** The section heading, already in the visitor's language. */
  readonly title: string;
  /** Output of `content.entry.list` for the FAQ entry type. */
  readonly data: QueryOutput<typeof ListEntriesQuery>;
}
