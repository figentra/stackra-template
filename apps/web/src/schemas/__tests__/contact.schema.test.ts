/**
 * Stackra file contract:
 * Purpose: the schema refuses what the service would refuse, with i18n keys as messages, and the
 *          honeypot is enforced.
 * Boundary: unit tier; the schema alone.
 * Runtime: node
 * Governing contract: ADR 0022, ADR 0095, ADR 0007
 */
import assert from "node:assert/strict";
import { describe, expect, it } from "@stackra/testing";
import { ContactInput } from "#src/schemas/contact.schema";

const valid = {
  name: "Lina",
  email: "lina@northwind.example",
  message: "We need a store for two brands.",
  consent: true,
  captchaToken: "tok",
};

/** Guards the contact form contract shared by client validation and the server route. */
describe(ContactInput, () => {
  /** Valid leads must pass and be normalised so stored names carry no stray whitespace. */
  it("accepts a complete submission and trims text", () => {
    expect(ContactInput.parse({ ...valid, name: "  Lina " }).name).toBe("Lina");
  });

  /** Errors are i18n keys so the UI can translate them in any locale. */
  it("reports i18n keys, not sentences, for each failing field", () => {
    const result = ContactInput.safeParse({
      ...valid,
      email: "nope",
      message: "short",
      consent: false,
    });
    assert(!result.success, "the schema refuses the input");
    const messages = result.error.issues.map((issue) => issue.message);
    expect(messages).toEqual(
      expect.arrayContaining([
        "web::contact.errors.email",
        "web::contact.errors.message",
        "web::contact.errors.consent",
      ]),
    );
  });

  /** A filled honeypot field marks a bot and must be rejected. */
  it("refuses a filled honeypot", () => {
    expect(ContactInput.safeParse({ ...valid, website: "http://spam" }).success).toBe(false);
  });
});
