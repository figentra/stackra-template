/**
 * Stackra file contract:
 * Purpose: proves the prefix rule: the default locale is unprefixed, another locale is prefixed
 *          once, and the Arabic root is `/ar`, not `/ar/`.
 * Boundary: unit tier; pure function with the i18n config resolved at its defaults by the testing
 *           helper.
 * Runtime: node
 * Governing contract: ADR 0022, ADR 0080, ADR 0007
 */
import { configFor } from "@stackra/config/testing";
import { Locale } from "@stackra/i18n";
import { describe, expect, it } from "@stackra/testing";
import { I18nConfig } from "#src/config/i18n.config";
import { localePath } from "#src/server/locale-path.server";

/** Guards the prefix rule behind every absolute URL the server writes. */
describe(localePath, () => {
  /** Each locale gets exactly the prefix its mount has. */
  it("prefixes every locale but the default, once", () => {
    const i18n = configFor(I18nConfig);
    expect(localePath(i18n, Locale.En, "/pricing")).toBe("/pricing");
    expect(localePath(i18n, Locale.Ar, "/pricing")).toBe("/ar/pricing");
    expect(localePath(i18n, Locale.Ar, "/")).toBe("/ar");
  });
});
