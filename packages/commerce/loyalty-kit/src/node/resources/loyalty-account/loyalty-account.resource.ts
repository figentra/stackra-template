/**
 * Stackra file contract:
 * Purpose: the staff screens for loyalty accounts in the admin area: list, View, enroll, freeze.
 *          Declared here, rendered by @stackra/panel; a package module contributes UI exactly like
 *          a service module.
 * Boundary: a declaration only. Pages follow from `operations`: List and View are standard reads
 *           gen writes (`loyalty_kit.loyalty_account.list@1` and `.get@1`, output
 *           LoyaltyAccountView); Create submits EnrollMemberAction, never a direct insert; there is
 *           no update operation. Table and infolist keys are `keyof LoyaltyAccount`, the form's are
 *           `keyof EnrollMemberInput`, so a renamed field is a type error. The title is the derived
 *           i18n key `loyalty_kit::resources.loyalty_account.title`; the customer area gets the
 *           overview document instead (one area per resource).
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 3, 11, 13 and 16), ADR 0164 (panels are resources),
 *                     ADR 0082 (API areas), ADR 0139
 */
import { ApiArea, SortDirection } from "@stackra/contracts";
import {
  type Actions,
  type BulkActions,
  type Form,
  type Infolist,
  Resource,
  type Table,
} from "@stackra/panel";
import { Icons } from "@stackra/ui/icons";
import { I18n } from "#stackra/i18n";
import type { EnrollMemberInput } from "#core/schemas/enroll-member-input.schema";
import { EnrollMemberAction } from "#node/actions/enroll-member.action";
import { FreezeAccountAction } from "#node/actions/freeze-account.action";
import { LoyaltyAccount } from "#node/models/loyalty-account.model";

/** Row and bulk actions hide when the permission or the record policy refuses. */
export class LoyaltyAccountResource extends Resource(LoyaltyAccount, {
  area: ApiArea.Admin,
  navigation: {
    group: I18n.loyalty_kit.nav.loyalty,
    icon: Icons.Star,
    order: 30,
  },
  operations: {
    list: true,
    get: true,
    create: EnrollMemberAction,
  },
}) {
  /** The list: the tier badge from the enum, frozen accounts flagged, newest first. */
  override table(t: Table<LoyaltyAccount>) {
    return t
      .columns((c) => [
        c.text("memberId").copyable().searchable(),
        c.enum("tier").sortable(),
        c.boolean("isFrozen", { trueLabel: I18n.loyalty_kit.account.frozen_badge }),
        c.count("entries").sortable(),
        c.dateTime("frozenAt").toggleable({ hiddenByDefault: true }),
        c.dateTime("createdAt").sortable(),
      ])
      .filters((f) => [
        f.select("tier"),
        f.boolean("isFrozen"),
        f.dateRange("createdAt"),
        f.trashed(),
      ])
      .defaultSort("createdAt", SortDirection.Desc);
  }

  /**
   * Enroll only: exactly the fields of EnrollMemberInput a person fills in. `accountId` is the PUT
   * address the panel mints when the form opens, so it is never a field.
   */
  override form(f: Form<EnrollMemberInput>) {
    return f.fields((x) => [x.text("principalId").required(), x.enum("tier")]);
  }

  /** The View page: the account, its notes and the ledger as a read-only relation panel. */
  override infolist(i: Infolist<LoyaltyAccount>) {
    return i.entries((e) => [
      e.text("memberId"),
      e.enum("tier"),
      e.boolean("isFrozen"),
      e.dateTime("frozenAt"),
      e.keyValue("notes"),
      e.relation("entries", { columns: ["kind", "points", "reference", "at"] }),
    ]);
  }

  /** Freeze on a row and on the View page; the record fills `accountId`. */
  override actions(a: Actions<LoyaltyAccount>) {
    return [a.run(FreezeAccountAction)];
  }

  /** Freeze many accounts at once with one confirmation; each is still checked by the policy. */
  override bulkActions(b: BulkActions<LoyaltyAccount>) {
    return [b.run(FreezeAccountAction)];
  }
}
