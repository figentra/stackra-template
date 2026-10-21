/**
 * Stackra file contract:
 * Purpose: the console screen for loyalty accounts: list, detail, create/edit form, filters, row
 *          and bulk actions. Declared here, rendered by @stackra/panel; a package module
 *          contributes UI exactly like a service module.
 * Boundary: data only. Builder methods are used because table, form and infolist are deep, repeated
 *           structures; everything else is a decorator option. Column keys are `keyof
 *           LoyaltyAccount`, actions are referenced by class, so a renamed field or action is a
 *           type error. Declared on the node side, rendered by @stackra/panel in the browser and in
 *           react-native.
 * Runtime: node
 * Governing contract: ADR 0164 (panels are resources), 0139
 */
import { FormBuilder, Infolist, Resource, Table } from "@stackra/panel";
import { Icons } from "@stackra/ui/icons";
import { Realm } from "@stackra/contracts";
import { I18n } from "#stackra/i18n";
import { LoyaltyTier } from "#core/enums/loyalty-tier.enum";
import { LoyaltyAccount } from "#node/models/loyalty-account.model";
import { EnrollMemberAction } from "#node/actions/enroll-member.action";
import { FreezeAccountAction } from "#node/actions/freeze-account.action";

/**
 * The Loyalty accounts screen in every panel that hosts the tenant-admin realm; the customer realm
 * gets the overview document instead. A package targets realms, never an app's panels.
 */
@Resource(LoyaltyAccount, {
  navigation: { group: I18n.loyalty_kit.nav.loyalty, icon: Icons.Star, order: 30 },
  realms: [Realm.TenantAdmin],
  // the form submits the action, never a direct insert; `list` defaults to the @Crud query
  create: EnrollMemberAction,
})
export class LoyaltyAccountResource extends Resource<LoyaltyAccount> {
  /**
   * The list: every column shape once; `bulkActions` run the action per selected row with one
   * confirmation.
   */
  table(t: Table<LoyaltyAccount>) {
    return t
      .columns((c) => [
        c.text("memberId").copyable().searchable(),
        // badge colours and labels come from the enum's meta
        c.enum("tier", LoyaltyTier).sortable(),
        c.boolean("isFrozen", { trueLabel: I18n.loyalty_kit.account.frozen_badge }),
        c.count("entries").sortable(),
        c.dateTime("frozenAt").toggleable({ hiddenByDefault: true }),
        c.dateTime("createdAt").sortable(),
      ])
      .filters((f) => [
        f.enum("tier", LoyaltyTier),
        f.boolean("isFrozen"),
        f.dateRange("createdAt"),
        f.trashed(),
      ])
      .defaultSort("createdAt", "desc")
      .rowActions([FreezeAccountAction])
      .bulkActions([FreezeAccountAction]);
  }

  /**
   * Create and edit. Field types, validation and labels come from the model decorators (ADR 0095);
   * every field shape once.
   */
  form(f: FormBuilder<LoyaltyAccount>) {
    return f.fields((x) => [
      x.text("memberId").required().disabledOnEdit(),
      x.enum("tier", LoyaltyTier),
      x.toggle("isFrozen"),
      x.dateTime("frozenAt").visibleWhen("isFrozen"),
      x.keyValue("notes", { keys: ["flaggedBy", "reason"] }),
      x
        .repeater("entries", (r) => [
          r.number("points"),
          r.enum("kind"),
          r.text("reference"),
          r.dateTime("at"),
        ])
        .readOnly(),
    ]);
  }

  /** The detail view: every entry shape once, with the ledger as a relation panel. */
  infolist(i: Infolist<LoyaltyAccount>) {
    return i.entries((e) => [
      e.text("memberId"),
      e.enum("tier", LoyaltyTier),
      e.boolean("isFrozen"),
      e.dateTime("frozenAt"),
      e.keyValue("notes"),
      e.relation("entries", { columns: ["kind", "points", "reference", "at"] }),
    ]);
  }
}
