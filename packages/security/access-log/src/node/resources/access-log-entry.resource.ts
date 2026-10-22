/**
 * Stackra file contract:
 * Purpose: the console screen that reads the audit trail: a list and a detail view of access
 *          records, never an edit.
 * Boundary: data only; read-only because the model is append-only. Column keys are `keyof
 *           AccessLogEntry`, so a renamed field is a type error. The console mounts it through the
 *           panel exactly like a service's resource.
 * Runtime: node
 * Governing contract: ADR 0164 (panels are resources), ADR 0134 (classification)
 */
import type { Infolist, Table } from "@stackra/panel";
import { Resource } from "@stackra/panel";
import { Icons } from "@stackra/ui/icons";
import { Realm } from "@stackra/contracts";
import { I18n } from "#stackra/i18n";
import { DataClassification } from "#core/enums/data-classification.enum";
import { AccessLogEntry } from "#node/models/access-log-entry.model";
import { AccessLogEntryPermissions } from "#node/permissions/access-log-entry.permission";

/**
 * The audit trail in every panel that hosts the tenant-admin realm; records cannot be created, edited or deleted from the
 * console.
 */
@Resource(AccessLogEntry, {
  navigation: { group: I18n.access_log.nav.audit, icon: Icons.Shield, order: 90 },
  realms: [Realm.TenantAdmin],
  permission: AccessLogEntryPermissions.read,
  readOnly: true,
})
export class AccessLogEntryResource extends Resource<AccessLogEntry> {
  /**
   * Newest first, filterable by classification and by date, because an audit question starts with
   * "when".
   */
  table(t: Table<AccessLogEntry>) {
    return t
      .columns((c) => [
        c.dateTime("at").sortable(),
        c.text("target").searchable(),
        c.enum("classification", DataClassification).sortable(),
        c.text("callId").copyable().toggleable({ hiddenByDefault: true }),
      ])
      .filters((f) => [f.enum("classification", DataClassification), f.dateRange("at")])
      .defaultSort("at", "desc");
  }

  /** The detail view: who read what, with the actor chain and the record ids exactly as stored. */
  infolist(i: Infolist<AccessLogEntry>) {
    return i.entries((e) => [
      e.dateTime("at"),
      e.text("target"),
      e.enum("classification", DataClassification),
      e.keyValue("actor"),
      e.list("subjects"),
    ]);
  }
}
