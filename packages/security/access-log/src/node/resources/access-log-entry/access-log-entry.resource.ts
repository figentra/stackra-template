/**
 * Stackra file contract:
 * Purpose: the audit trail in the admin area: a searchable, filterable list and a View page of
 *          access records, never an edit.
 * Boundary: a declaration; gen runs each member once and records the tree in the manifest. Pages
 *           follow from `operations`: List and View, both standard reads gen writes
 *           (`access_log.access_log_entry.list@1` and `.get@1`) under the derived read
 *           permission; there is no create, update or delete operation, because the model is
 *           append-only and only the purge job deletes. The list row is the model itself, so the
 *           model is the only type argument (`Resource<AccessLogEntry>`) and table and infolist
 *           keys are its fields. The table is a server contract: search reads the model's
 *           `@Searchable` text field, and every sortable or filterable key is indexed. Labels are
 *           derived (`access_log::resources.access_log_entry.*`); the classification column takes
 *           its badge from the enum.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 3, 13 and 16), ADR 0164 (as amended by programming
 *                     model v3.1, AGENTS.md: tables as server contracts), ADR 0082 (API areas),
 *                     ADR 0134 (classification)
 */
import { ApiArea, SortDirection } from "@stackra/contracts";
import { type Infolist, Resource, type Table } from "@stackra/panel";
import { I18n } from "#stackra/i18n";
import type { AccessLogEntry } from "#node/models/access-log-entry.model";

/** Records cannot be created, edited or deleted from the console. */
export class AccessLogEntryResource extends Resource<AccessLogEntry>({
  area: ApiArea.Admin,
  navigation: {
    group: I18n.access_log.nav.audit,
    icon: "shield",
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
        c.from("at").sortable(),
        c.from("target"),
        c.from("classification").sortable(),
        c.from("callId").copyable().hidden(),
      ])
      .filters((f) => [f.from("classification"), f.from("at")])
      .defaultSort("at", SortDirection.Desc);
  }

  /** The View page: who read what, with the actor chain and the record ids exactly as stored. */
  override infolist(i: Infolist<AccessLogEntry>) {
    return i.entries((e) => [
      e.from("at"),
      e.from("target"),
      e.from("classification"),
      e.from("actor"),
      e.from("subjects"),
    ]);
  }
}
