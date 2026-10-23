/**
 * Stackra file contract:
 * Purpose: why a ledger entry exists; stored on every row and shown as a badge in the console.
 * Boundary: an `Enum.of` value plus the type of the same name, in the leaf entry. The code is the
 *           column value; the tone colours the badge. Labels are the derived i18n keys
 *           `loyalty_kit::enums.entry_kind.<code>`. `Expire` and `Adjust` are written only by the
 *           kit's own job and workflow; a host never appends them directly.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 15, 16 and 20), ADR 0231 (snake_case codes)
 */
import { Tone } from "@stackra/contracts";
import { Enum } from "@stackra/validation";

/** One case per kind; cases are plain codes, so they compare with `===`. */
export const EntryKind = Enum.of({
  Earn: ["earn", { tone: Tone.Success }],
  Redeem: ["redeem", { tone: Tone.Default }],
  Expire: ["expire", { tone: Tone.Warning }],
  Adjust: ["adjust", { tone: Tone.Info }],
});

/** One of the codes above. */
export type EntryKind = Enum.Value<typeof EntryKind>;
