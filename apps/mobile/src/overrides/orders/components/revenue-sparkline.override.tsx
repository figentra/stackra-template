/**
 * Stackra file contract:
 * Purpose: this app's native component for the revenue-today widget tile the orders module declares
 *          as an override point. Without it the widget renders through the panel's default tile.
 * Boundary: the override is a class whose options name the component; props are typed from the
 *           override point, so a changed widget output is a type error here. Listed in
 *           `#stackra/overrides` with its source file.
 * Runtime: react-native
 * Governing contract: ADR 0234, ADR 0164
 */
import { Override } from "@stackra/panel";
import { RevenueSparkline } from "#src/components/ui/revenue-sparkline";
import { Commerce } from "#stackra/clients";

/**
 * Binds the sparkline to `orders`' `RevenueSparkline` point; two overrides of one point in a member
 * is a gen error.
 */
@Override(Commerce.overrides.RevenueSparkline, { component: RevenueSparkline })
export class RevenueSparklineOverride {}
