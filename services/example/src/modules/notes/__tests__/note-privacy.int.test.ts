/**
 * Stackra file contract:
 * Purpose: the service's privacy, retention and audit wiring on a real Postgres, as the NOBYPASSRLS service role: a
 *          data-subject export holds the person's notes in the running tenant and nobody else's; an erasure deletes
 *          them there, keeps a note under a legal hold and leaves other people and other tenants alone; the nightly
 *          prune job deletes notes untouched for two years, keeps younger ones and keeps every note of an author under
 *          a hold; and every note action, done or refused, is the next entry of its tenant's audit chain.
 * Boundary: integration tier (`.int`, `stackra test --tier int`, Docker). The drivers are the ones this service binds
 *           (`#modules/compliance/drivers/*`) over the package declarations it registers (`NotePersonalData`,
 *           `Retention`); the export job, the erasure saga's `erase` step and the prune job are the packages' own
 *           classes, called the way their runners call them, in the tenant `TenantIsolationService` sets, as the pipeline
 *           does. The saga engine and the cron runner are their packages' tests. The export disk is the memory disk.
 * Runtime: node (vitest)
 * Governing contract: ADR 0022 (test placement); ADR 0182 (test tiers); ADR 0189 (decisions 1, 2 and 4); ADR 0134
 *                     (decisions 3 and 4); ADR 0212 (decision 1); ADR 0239.
 */
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

import { AuditLogEntry } from "@stackra/access-log/node";
import { ActionPipeline } from "@stackra/actions";
import type { Resolver } from "@stackra/actions";
import {
  AccessControl,
  AuditTrail,
  CallIsolation,
  IdempotencyStore,
  UnitOfWork,
} from "@stackra/actions/contracts";
import { fakeActionContext } from "@stackra/actions/testing";
import { type AnyClass, type Container, Driver, SystemClockDriver } from "@stackra/container";
import { type Actor, ActorKind, type Logger, type PublicId, Realm } from "@stackra/contracts";
import { connectHoldRegistry, repositoryOf } from "@stackra/database";
import { DatabaseUnitOfWorkDriver, PostgresIdempotencyStoreDriver } from "@stackra/database/node";
import { usePostgres } from "@stackra/database/testing";
import { PruneRecordsAction } from "@stackra/data-maintenance/node";
import { FilesystemConfig, MemoryFileSystemDriver } from "@stackra/filesystem";
import { PrivacyConfig, SubjectExportService } from "@stackra/privacy";
import {
  EraseSubjectWorkflow,
  ExportSubjectDataAction,
  PlaceHoldAction,
  RepositoryPersonalDataStoreDriver,
} from "@stackra/privacy/node";
import { MemoryScopeTreeDriver } from "@stackra/scope";
import { CallIsolationDriver, TenantIsolationService } from "@stackra/tenancy/node";
import { fakeTenantId, runAsTenant, tenantIsolationOptions } from "@stackra/tenancy/testing";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "@stackra/testing";

import { PostgresAuditTrailDriver } from "#modules/compliance/drivers/postgres-audit-trail.driver";
import { PostgresHoldRegistryDriver } from "#modules/compliance/drivers/postgres-hold-registry.driver";
import { PostgresSubjectSaltStoreDriver } from "#modules/compliance/drivers/postgres-subject-salt-store.driver";
import { CreateNoteAction } from "#modules/notes/actions/create-note.action";
import { UpdateNoteAction } from "#modules/notes/actions/update-note.action";
import { NoteFactory } from "#modules/notes/database/factories/note.factory";
import { NoteService } from "#modules/notes/services/note.service";

const postgres = usePostgres({
  migrationsDirectory: fileURLToPath(new URL("../../../../.stackra/migrations", import.meta.url)),
});

/** The role the service connects as: no superuser, no BYPASSRLS, so the policies decide. */
const { role } = tenantIsolationOptions();

/** A user of the tenant `scope` with the public id `id`. */
function person(scope: PublicId<"scp">, id: string): Actor {
  return { kind: ActorKind.User, id: id as PublicId<"usr">, realm: Realm.Staff, scopeId: scope };
}

/** Runs `work` as the service role, in one transaction the pipeline's own unit of work joins. */
function asService<T>(work: () => Promise<T>): Promise<T> {
  return postgres.database.transaction(async () => {
    await postgres.database.em().execute(`set local role "${role}"`);
    return work();
  });
}

/** Runs `work` as the service role under the tenant the service sets for `actor`, as the pipeline does. */
function asOwner<T>(actor: Actor, work: () => Promise<T>): Promise<T> {
  const tenancy = new TenantIsolationService(postgres.database);
  return asService(() => tenancy.withTenant(actor, work));
}

/** One note of `author` in the tenant `scope`, stored as the container's user. */
async function note(scope: PublicId<"scp">, author: Actor, title: string): Promise<string> {
  const created = await runAsTenant(scope, () =>
    NoteFactory.new().create({
      tenantId: scope,
      authorId: author.id,
      title,
      body: `${title} text`,
    }),
  );
  return created.id;
}

/** Ages a note: its last change is `days` ago (as the container's user, past row security). */
async function age(id: string, days: number): Promise<void> {
  await postgres.database
    .em()
    .execute(
      `update "notes"."notes" set updated_at = now() - make_interval(days => ?::int) where id = ?`,
      [days, id],
    );
}

/** Every note title of the tenant `scope` really stored, read as the container's user. */
async function titles(scope: PublicId<"scp">): Promise<string[]> {
  const rows = (await postgres.database
    .em()
    .execute('select title from "notes"."notes" where tenant_id = ? order by title', [scope])) as {
    title: string;
  }[];
  return rows.map((row) => row.title);
}

/** Places a legal hold on `recordId` (a note id, or a person's id for all their notes) as `actor`, in its tenant. */
function hold(actor: Actor, model: string, recordId: string): Promise<unknown> {
  return asOwner(actor, () =>
    new PlaceHoldAction(postgres.database).handle(
      { model, recordId, reason: "litigation" } as never,
      fakeActionContext({ actor }),
    ),
  );
}

/** Allows every call: how IAM decides is IAM's own test. */
class AllowAll extends Driver(AccessControl) {
  async require(): Promise<void> {}

  async authorize(): Promise<void> {}
}

/** A logger that keeps nothing: every call in these tests has a tenant, so the driver never warns. */
const silent = { debug() {}, info() {}, warn() {}, error() {} } as unknown as Logger;

/** The pipeline over the real isolation, unit of work, idempotency store and this service's audit trail. */
function pipeline(): ActionPipeline {
  const { database } = postgres;
  const tenancy = new TenantIsolationService(database);
  const notes = new NoteService();
  const AuditEntries = repositoryOf(AuditLogEntry) as unknown as new () => never;
  const bound = new Map<AnyClass, object>([
    [AccessControl, new AllowAll()],
    [UnitOfWork, new DatabaseUnitOfWorkDriver()],
    [IdempotencyStore, new PostgresIdempotencyStoreDriver(database)],
    [CallIsolation, new CallIsolationDriver(database, tenancy, new MemoryScopeTreeDriver())],
    [AuditTrail, new PostgresAuditTrailDriver(new AuditEntries(), tenancy, silent)],
    [CreateNoteAction, new CreateNoteAction(notes)],
    [UpdateNoteAction, new UpdateNoteAction(notes)],
  ]);
  const resolver: Resolver = {
    has: (type) => bound.has(type),
    get: <U extends object>(type: AnyClass<U>) => bound.get(type) as U,
  };
  return new ActionPipeline(resolver);
}

/** The audit chain of the tenant `scope`, oldest first, read as the container's user. */
async function chain(
  scope: PublicId<"scp">,
): Promise<{ key: string; outcome: string; code: string | null }[]> {
  return (await postgres.database
    .em()
    .execute(
      'select key, outcome, code from "access_log"."audit_log_entries" where tenant_id = ? order by sequence',
      [scope],
    )) as { key: string; outcome: string; code: string | null }[];
}

/**
 * Gives the service role (no login, no BYPASSRLS) the tables of every schema the migrations made: the notes, the
 * idempotency store, the holds and salts, the audit chain, and the packages' tables the prune job visits.
 */
async function prepare(): Promise<void> {
  const em = postgres.database.em();
  await em.execute('truncate table "notes"."notes" cascade');
  await em.execute(
    `do $$ begin if not exists (select 1 from pg_roles where rolname = '${role}') then create role "${role}" nologin nobypassrls; end if; end $$`,
  );
  const schemas = (await em.execute(
    "select nspname as name from pg_namespace where nspname not like 'pg\\_%' and nspname not in ('information_schema', 'public')",
  )) as { name: string }[];
  for (const { name: schema } of schemas) {
    await em.execute(`grant usage on schema "${schema}" to "${role}"`);
    await em.execute(
      `grant select, insert, update, delete on all tables in schema "${schema}" to "${role}"`,
    );
    await em.execute(`grant usage, select on all sequences in schema "${schema}" to "${role}"`);
  }
}

describe("the notes service's privacy, retention and audit", () => {
  beforeAll(() => {
    // the registry checks each hold's owner through the bound CallIsolation, as a server's container gives it
    const { database } = postgres;
    const isolation = new CallIsolationDriver(
      database,
      new TenantIsolationService(database),
      new MemoryScopeTreeDriver(),
    );
    const container = {
      has: (type: unknown) => type === CallIsolation,
      get: () => isolation,
    } as unknown as Container;
    connectHoldRegistry(new PostgresHoldRegistryDriver(database, container));
  });

  afterAll(() => {
    connectHoldRegistry(undefined);
  });

  beforeEach(prepare);

  /** A data-subject export (GDPR Art. 15 and 20) is the person's notes in the running tenant, as a zip behind a link. */
  it("exports a person's notes in the tenant, and nobody else's", async () => {
    const a = fakeTenantId();
    const b = fakeTenantId();
    const alice = person(a, "usr_01ja00000000000000000000a1");
    const bob = person(a, "usr_01ja00000000000000000000b1");
    await note(a, alice, "alice-one");
    await note(a, alice, "alice-two");
    await note(a, bob, "bob-one");
    await note(b, person(b, alice.id), "alice-elsewhere");

    const disk = new MemoryFileSystemDriver(new FilesystemConfig(), new SystemClockDriver());
    const exporter = new SubjectExportService(
      new RepositoryPersonalDataStoreDriver(),
      disk,
      new PrivacyConfig(),
    );
    const collected = await asOwner(alice, () => exporter.collect(alice.id, new Date()));
    const section = collected.sections.find((entry) => entry.kind === "notes.note");
    expect(
      section?.records
        .map((record) => record.fields)
        .toSorted((x, y) => String(x["title"]).localeCompare(String(y["title"]))),
    ).toEqual([
      { title: "alice-one", body: "alice-one text" },
      { title: "alice-two", body: "alice-two text" },
    ]);

    const link = await asOwner(alice, () =>
      new ExportSubjectDataAction(exporter).handle(
        { subject: alice.id } as never,
        fakeActionContext({ actor: alice }),
      ),
    );
    expect(link.records).toBe(2);
    expect(link.path).not.toContain(alice.id);
    const zip = await disk.read(link.path);
    expect([...zip.subarray(0, 2)]).toEqual([0x50, 0x4b]);
  });

  /** An erasure (GDPR Art. 17) deletes the person's notes in the tenant; a held note stays and is counted as kept. */
  it("erases a person's notes in the tenant, keeping a held note and everyone else's", async () => {
    const a = fakeTenantId();
    const b = fakeTenantId();
    const alice = person(a, "usr_01ja00000000000000000000a2");
    const bob = person(a, "usr_01ja00000000000000000000b2");
    await note(a, alice, "alice-gone");
    const held = await note(a, alice, "alice-held");
    await note(a, bob, "bob-stays");
    await note(b, person(b, alice.id), "alice-elsewhere");
    await hold(alice, "Note", held);

    const saga = new EraseSubjectWorkflow(
      new RepositoryPersonalDataStoreDriver(),
      new PostgresSubjectSaltStoreDriver(postgres.database),
      undefined as never, // the outbox: only the `redact` step reads it
    );
    const run = { input: { erasureId: randomUUID(), subject: alice.id } } as never;
    const erased = await asOwner(alice, () => saga.erase(run));

    expect(erased.erased).toEqual([{ kind: "notes.note", method: "delete", count: 1 }]);
    expect(erased.kept).toEqual([{ kind: "notes.note", reason: "hold", count: 1 }]);
    expect(await titles(a)).toEqual(["alice-held", "bob-stays"]);
    expect(await titles(b)).toEqual(["alice-elsewhere"]);
  });

  /** The nightly prune job deletes notes untouched for two years in the tenant, unless their author is held. */
  it("prunes notes untouched for two years, keeping younger ones and a held author's", async () => {
    const a = fakeTenantId();
    const b = fakeTenantId();
    const alice = person(a, "usr_01ja00000000000000000000a3");
    const bob = person(a, "usr_01ja00000000000000000000b3");
    await age(await note(a, bob, "bob-old"), 731);
    await age(await note(a, bob, "bob-recent"), 729);
    await age(await note(a, alice, "alice-old-held"), 900);
    await age(await note(b, person(b, bob.id), "bob-old-elsewhere"), 731);
    await hold(alice, "subject", alice.id);

    const report = await asOwner(alice, () =>
      new PruneRecordsAction().handle({} as never, fakeActionContext({ actor: alice })),
    );

    expect(report).toMatchObject({ purged: 1, held: 1 });
    expect(await titles(a)).toEqual(["alice-old-held", "bob-recent"]);
    expect(await titles(b)).toEqual(["bob-old-elsewhere"]);
  });

  /**
   * Each note action is audited in its tenant's chain, a refusal too; another tenant's chain holds none of it.
   * Known gap (STA-1583, core): @stackra/access-log 0.33.x reads the chain head with `findOne({})`, which MikroORM
   * refuses, and maps `outcome` as json, which fails its check, so every append throws. Remove `.fails` when the
   * template's core pin carries the fix (`figentra/sta-1583-access-log-chain-head`); it passes on a copy patched with it.
   */
  it.fails("appends every note action, done or refused, to its tenant's audit chain", async () => {
    const a = fakeTenantId();
    const b = fakeTenantId();
    const alice = person(a, "usr_01ja00000000000000000000a4");
    const created = await asService(() =>
      pipeline().execute(CreateNoteAction, { title: "audited" } as never, {
        actor: alice,
        idempotencyKey: randomUUID(),
      }),
    );
    // caught inside the transaction, so the refusal's entry, written after the call's own work rolled back, stays
    const refusal = await asService(() =>
      pipeline()
        .execute(UpdateNoteAction, { noteId: created.id } as never, { actor: alice })
        .catch((error: unknown) => error),
    );
    expect(refusal).toMatchObject({ code: "empty_note_update" });

    expect(await chain(a)).toEqual([
      { key: "notes.note.create@1", outcome: "ok", code: null },
      { key: "notes.note.update@1", outcome: "refused", code: "empty_note_update" },
    ]);
    expect(await chain(b)).toEqual([]);
  });
});
