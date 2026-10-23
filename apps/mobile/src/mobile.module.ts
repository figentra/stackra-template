/**
 * Stackra file contract:
 * Purpose: the root module of the mobile app: the remote modules whose UI is compiled into the
 *          binary. Mobile modules are fixed when the binary is built, never loaded at run time.
 * Boundary: the one `imports` list this app writes. Gen orders the list topologically from the
 *           producers' committed manifests, so the order below only breaks ties between
 *           independent roots: identity boots first. Routes, layouts, menus, blocks, documents,
 *           stores and config classes are discovered by folder and wired by gen; each package's
 *           context mounts from the config class present (`src/config/`), so the app lists no
 *           provider. Nobody writes an entry: gen writes `.stackra/entry/native.ts`, which passes
 *           this class and the generated wiring to `createApp`. Adding a module means adding it
 *           here and rebuilding; a tenant whose plan lacks one sees its routes hidden by
 *           entitlement.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decisions 12, 14 and 16), ADR 0295 (decisions 7 and 10), ADR 0268
 *                     (R17), ADR 0263
 */
import { Module } from "@stackra/app";
import { Commerce, Experience, Identity, Notifications } from "#stackra/clients";

/** The six modules the binary ships: identity, devices, catalogue, orders, inbox, documents. */
export class MobileModule extends Module({
  imports: [
    Identity.modules.Identity,
    Identity.modules.Devices,
    Commerce.modules.Catalogue,
    Commerce.modules.Orders,
    Notifications.modules.Messages,
    Experience.modules.Experience,
  ],
}) {}
