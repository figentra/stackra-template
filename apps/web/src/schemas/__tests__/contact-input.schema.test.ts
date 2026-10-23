/**
 * Stackra file contract:
 * Purpose: the schema refuses what the service would refuse, with i18n keys as messages, and the
 *          honeypot is enforced.
 * Boundary: unit tier; the shape alone, validated through `validate` with the schema gen compiled
 *           from it.
 * Runtime: node
 * Governing contract: ADR 0022, ADR 0294 (decision 4), ADR 0095, ADR 0007
 */
import assert from "node:assert/strict";
import { describe, expect, it } from "@stackra/testing";
import { validate } from "@stackra/validation";
import { ContactInput } from "#src/schemas/contact-input.schema";

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
    const parsed = validate(ContactInput, { ...valid, name: "  Lina " });
    expect(parsed.success && parsed.data.name).toBe("Lina");
  });

  /** Errors are i18n keys so the UI can translate them in any locale. */
  it("reports i18n keys, not sentences, for each failing field", () => {
    const result = validate(ContactInput, {
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
    expect(validate(ContactInput, { ...valid, website: "http://spam" }).success).toBe(false);
  });
});
