/**
 * Stackra file contract:
 * Purpose: the data classifications a logged class may declare; stored on every record and
 *          filtered on in the console.
 * Boundary: an `Enum.of` value plus the type of the same name, in the leaf entry, so a call site
 *           writes `DataClassification.Personal`, never a bare string. The code is the column
 *           value; labels are the derived i18n keys `access_log::enums.data_classification.<code>`.
 * Runtime: isomorphic
 * Governing contract: ADR 0294 (decisions 15, 16 and 20), ADR 0134 (classification), ADR 0231
 *                     (snake_case codes)
 */
import { Enum } from "@stackra/validation";

/** The four classes ADR 0134 names; cases are plain codes, so they compare with `===`. */
export const DataClassification = Enum.of({
  Personal: "personal",
  Financial: "financial",
  Health: "health",
  Pseudonymous: "pseudonymous",
});

/** One of the codes above. */
export type DataClassification = Enum.Value<typeof DataClassification>;
