/**
 * Stackra file contract:
 * Purpose: `EXAMPLE_COPY`, the English text of the example's console page and mobile screen.
 * Boundary: data only.
 * Runtime: isomorphic
 * Governing contract: ADR 0007 (documentation).
 */

// shortcut: English literals until the package ships its `lang/` catalogues and the screens translate.
/** The example's text. */
export const EXAMPLE_COPY = Object.freeze({
  title: "Acme example",
  console:
    "This page is the @figentra/acme-example package, loaded into the OS console shell through its import map.",
  mobile:
    "This screen is the @figentra/acme-example package, registered into the OS mobile template.",
});
