/**
 * Stackra file contract:
 * Purpose: the root module of the brand package: it owns the `brand` key, the namespace of the
 *          package's assets (`brand::public/images/mark.svg`).
 * Boundary: no bindings and no exports: the tokens and the CSS function are plain values a host
 *           imports from `@acme/brand`, and the CSS is a file it imports by path. A host imports
 *           this module only to serve the mark through its asset namespace.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 12 and 15), ADR 0234 (module assets)
 */
import { Module } from "@stackra/app";

/** Exists for its key; nothing is injected from it. */
export class BrandModule extends Module {}
