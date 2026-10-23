/**
 * Stackra file contract:
 * Purpose: the audit trail in the admin area: a list and a View page of access records, never an
 *          edit.
 * Boundary: a declaration only. Pages follow from `operations`: List and View, both standard reads
 *           gen writes (`access_log.access_log_entry.list@1` and `.get@1`) under the derived read
 *           permission; there is no create or update operation, because the model is append-only.
 *           Column and entry keys are `keyof AccessLogEntry`, so a renamed field is a type error.
 *           The title is the derived i18n key `access_log::resources.access_log_entry.title`; the
 *           classification column is the built-in enum column.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 3, 13 and 16), ADR 0164 (panels are resources), ADR 0082
 *                     (API areas), ADR 0134 (classification)
 */
import { ApiArea, SortDirection } from "@stackra/contracts";
import { type Infolist, Resource, type Table } from "@stackra/panel";
import { Icons } from "@stackra/ui/icons";
import { I18n } from "#stackra/i18n";
import { AccessLogEntry } from "#node/models/access-log-entry.model";

/** Records cannot be created, edited or deleted from the console. */
export class AccessLogEntryResource extends Resource(AccessLogEntry, {
  area: ApiArea.Admin,
  navigation: {
    group: I18n.access_log.nav.audit,
    icon: Icons.Shield,
    order: 90,
  },
  operations: {
    list: true,
    get: true,
  },
}) {
  /**
   * Newest first, filterable by classification and by date, because an audit question starts with
   * "when".
   */
  override table(t: Table<AccessLogEntry>) {
    return t
      .columns((c) => [
        c.dateTime("at").sortable(),
        c.text("target").searchable(),
        c.enum("classification").sortable(),
        c.text("callId").copyable().toggleable({ hiddenByDefault: true }),
      ])
      .filters((f) => [f.select("classification"), f.dateRange("at")])
      .defaultSort("at", SortDirection.Desc);
  }

  /** The View page: who read what, with the actor chain and the record ids exactly as stored. */
  override infolist(i: Infolist<AccessLogEntry>) {
    return i.entries((e) => [
      e.dateTime("at"),
      e.text("target"),
      e.enum("classification"),
      e.keyValue("actor"),
      e.list("subjects"),
    ]);
  }
}
