/**
 * Stackra file contract:
 * Purpose: the app definition of @figentra/acme-console: identity and targets as static data that gen reads from the
 *          syntax tree without running it. The member key is derived from the folder name; there is no key option.
 * Boundary: data only; no function, no environment read and no import of the app's own code. The area is the example
 *           service's, so the console hosts the panel its resources live in.
 * Runtime: node
 * Governing contract: ADR 0295 (decisions 1 and 2); ADR 0294 (rule R12); ADR 0082 (API areas).
 */
import { ApiArea, defineApp, Target } from "@stackra/contracts";

/** Read by `stackra gen`, `stackra validate` and the Vite config. */
export default defineApp({ targets: [Target.Web], area: ApiArea.App, name: "Console" });
