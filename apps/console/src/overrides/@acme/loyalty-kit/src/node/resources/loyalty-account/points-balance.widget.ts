/**
 * Stackra file contract:
 * Purpose: the console's placement of @acme/loyalty-kit's `PointsBalanceWidget`: the kit leaves it
 *          unplaced (only its overview document shows it), and the console puts it on the home
 *          dashboard's main grid, after the services' own widgets.
 * Boundary: a placement shadow at the owner's own path under `src/overrides/<owner>/`: it keeps the
 *           base's name, imports the base as `BasePointsBalanceWidget` and may change only the
 *           slot, order, size and params (`Widget.place`). The query, its permission and the
 *           renderer stay the kit's; the renderer is shadowed separately beside the kit's react
 *           path. A second placement of the same widget in this app fails gen
 *           (`override_duplicate`).
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 13 and 20; as amended by programming model v3.1,
 *                     AGENTS.md: the Base alias and the central overrides tree), ADR 0164
 */
import { PointsBalanceWidget as BasePointsBalanceWidget } from "@acme/loyalty-kit/node";
import { Widget } from "@stackra/panel";
import { Slots } from "#stackra/slots";

/** The kit's balance tile on the console's home dashboard, fortieth in the main grid. */
export class PointsBalanceWidget extends Widget.place(BasePointsBalanceWidget, {
  slot: Slots.Dashboard.Main,
  order: 40,
}) {}
