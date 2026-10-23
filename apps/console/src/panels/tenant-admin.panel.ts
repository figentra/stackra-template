/**
 * Stackra file contract:
 * Purpose: declares the staff panel the console mounts at the root. It hosts the admin API area, so
 *          gen places here every consumed resource, widget, document and settings page whose area
 *          is `ApiArea.Admin`.
 * Boundary: a declaration only; gen collects it into every member's `#stackra/panels` with the area
 *           it hosts, and an area no panel of this app hosts is not mounted here. The key
 *           (`tenant_admin`) is derived from the file. The shell component and its navigation are
 *           the console's (routes/shell/).
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 14, 16 and 20), ADR 0164 (panels), ADR 0082 (API areas)
 */
import { ApiArea } from "@stackra/contracts";
import { Panel } from "@stackra/panel";

/** The tenant's own staff console, mounted at `/` behind the shell's session check. */
export class TenantAdminPanel extends Panel({
  path: "/",
  area: ApiArea.Admin,
}) {}
