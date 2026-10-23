/**
 * Stackra file contract:
 * Purpose: proves `/open` turns the console's own links (the PWA protocol handler and the desktop
 *          deep link) into the in-app path they name, keeps the query, and sends a foreign scheme,
 *          an origin-leaving path, a path that reads as `//host` only after dot-segment
 *          normalisation and an unparsable link to `/`.
 * Boundary: unit tier; `runRouteLoader` builds the class with the console's config overrides
 *           (`web+acme`, `acme-console`) and calls its loader with a fake RouteContext.
 * Runtime: browser
 * Governing contract: ADR 0022, ADR 0254, ADR 0255
 */
import { describe, expect, it } from "@stackra/testing";
import { runRouteLoader } from "@stackra/testing/react";
import { OpenRoute } from "#src/routes/open/open.route";

/** Runs the loader for one `?url=` and returns where it redirected. */
async function open(url: string) {
  const result = await runRouteLoader(OpenRoute, { search: { url } });
  return result.redirect;
}

/** Guards the one entry point outside links use, which handles untrusted input. */
describe(OpenRoute, () => {
  /** Both registered schemes reach the same in-app page, with its query. */
  it("opens the path a registered link names", async () => {
    expect(await open("acme-console://orders/orders/ord_01JA0000000000000000000001")).toBe(
      "/orders/orders/ord_01JA0000000000000000000001",
    );
    expect(await open("web+acme://orders/orders?status=open")).toBe("/orders/orders?status=open");
  });

  /** Anything that is not one of the console's links, or would leave the origin, lands on `/`. */
  it.each([
    "https://evil.example/orders",
    "acme-console:////evil.example",
    "web+acme:/\\evil.example",
    // a registered scheme whose path only normalises to `//evil.example` once resolved
    "acme-console://.//evil.example",
    "web+acme://%2e%2e//evil.example",
    "not a link",
  ])("sends %j to /", async (url) => {
    expect(await open(url)).toBe("/");
  });
});
