/**
 * Stackra file contract:
 * Purpose: why a ledger entry exists; stored on every row and shown as a badge in the console.
 * Boundary: a class enum. `Expire` and `Adjust` are written only by the
 *           kit's own job and workflow; a host never appends them directly.
 * Runtime: isomorphic
 * Governing contract: ADR 0231 (snake_case codes), guides/programming-model.mdx#enums
 */
import { Tone } from "@stackra/contracts";
import { Enum } from "@stackra/schema";
import { I18n } from "#stackra/i18n";

/** One case per kind; `EntryKind.schema` parses the column value back to the singleton. */
export class EntryKind extends Enum<EntryKind> {
  /** A purchase credited points. */
  static readonly Earn = EntryKind.case("earn", {
    label: I18n.loyalty_kit.kinds.earn,
    color: Tone.Success,
  });
  /** A redemption debited points. */
  static readonly Redeem = EntryKind.case("redeem", {
    label: I18n.loyalty_kit.kinds.redeem,
    color: Tone.Default,
  });
  /** The expiry job removed stale earned points. */
  static readonly Expire = EntryKind.case("expire", {
    label: I18n.loyalty_kit.kinds.expire,
    color: Tone.Warning,
  });
  /** A compensation or a staff correction. */
  static readonly Adjust = EntryKind.case("adjust", {
    label: I18n.loyalty_kit.kinds.adjust,
    color: Tone.Info,
  });
}
