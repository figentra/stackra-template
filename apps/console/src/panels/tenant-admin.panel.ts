/**
 * Stackra file contract:
 * Purpose: declares the staff panel the console mounts at the root. It hosts the tenant-admin
 *          realm, so gen places here every consumed resource, widget, document and settings page
 *          that targets `Realm.TenantAdmin`.
 * Boundary: a declaration only; gen collects it into every member's `#stackra/panels` with the
 *           realms each panel hosts; a realm no panel of this app hosts is not mounted here. The
 *           shell component and its navigation are the console's.
 * Runtime: browser
 * Governing contract: ADR 0164 (panels), ADR 0231 (snake_case machine codes)
 */
import { Realm } from "@stackra/contracts";
import { Panel } from "@stackra/panel";

/** The tenant's own staff console, mounted at `/` behind the shell's session guard. */
@Panel({ key: "tenant_admin", path: "/", realms: [Realm.TenantAdmin] })
export class TenantAdminPanel {}
