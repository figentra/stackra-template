/**
 * Stackra file contract:
 * Purpose: the data classifications a logged method may declare; stored on every record and
 *          filtered on in the console.
 * Boundary: a class enum so a call site writes `DataClassification.Personal`, never a bare string.
 *           `enums/` would appear with its second file; the catalogue shows the folder.
 * Runtime: isomorphic
 * Governing contract: ADR 0134 (classification), ADR 0128 (amended: class enums), ADR 0231
 *                     (snake_case codes)
 */
import { Enum } from "@stackra/schema";
import { I18n } from "#stackra/i18n";

/** The four classes ADR 0134 names; `value` is the column string. */
export class DataClassification extends Enum<DataClassification> {
  /** Directly identifies a person. */
  static readonly Personal = DataClassification.case("personal", {
    label: I18n.access_log.classifications.personal,
  });
  /** Payment and account data. */
  static readonly Financial = DataClassification.case("financial", {
    label: I18n.access_log.classifications.financial,
  });
  /** Health data; the strictest retention. */
  static readonly Health = DataClassification.case("health", {
    label: I18n.access_log.classifications.health,
  });
  /** Identifies a person only through a linkage the reader does not hold. */
  static readonly Pseudonymous = DataClassification.case("pseudonymous", {
    label: I18n.access_log.classifications.pseudonymous,
  });
}
