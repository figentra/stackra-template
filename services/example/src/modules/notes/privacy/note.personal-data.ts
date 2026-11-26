/**
 * Stackra file contract:
 * Purpose: `NotePersonalData`, the personal data a note holds: its author (`authorId`) is the subject, and its title
 *          and text are free text that may name anyone, so a data-subject export (GDPR Art. 15 and 20, PDPL Art. 4)
 *          copies them and an erasure (GDPR Art. 17, PDPL destruction) deletes the author's notes.
 * Boundary: data only, no exporter or eraser: `@stackra/privacy`'s export job and erasure saga do the work through
 *           `PersonalDataStore`, in the running tenant (a person who wrote notes in two tenants is erased per tenant).
 *           `delete` removes the whole row, so nothing of the note is left; a legal hold on the note still keeps it.
 *           `authorId` is also the note's hold link, so a hold placed on the author's public id keeps every note they
 *           wrote from the retention prune. shortcut: registered by hand below until gen registers `privacy/` groups
 *           (STA-339); `NoteService` imports this file so every process that stores notes has the declaration.
 * Runtime: node
 * Governing contract: ADR 0189 (decisions 1, 2 and 4); ADR 0134 (decision 4: legal holds); ADR 0294 (decisions 16 and
 *                     25); ADR 0305 (one declaration per file).
 */
import { registerHoldLinks } from "@stackra/database";
import { PersonalData, registerPersonalData } from "@stackra/privacy";
import { ErasureMethod } from "@stackra/privacy/contracts";

import { Note } from "#modules/notes/models/note.model";

/** A note's author is its subject; erasure deletes the author's notes. */
export class NotePersonalData extends PersonalData({
  model: () => Note,
  subject: "authorId",
  fields: {
    title: ErasureMethod.Delete,
    body: ErasureMethod.Delete,
  },
}) {}

registerPersonalData("notes", [NotePersonalData]);
registerHoldLinks([[Note, ["authorId"]]]);
