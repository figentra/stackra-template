/**
 * Stackra file contract:
 * Purpose: registers the kit's own React component for the PointsIssuedTile point it declared in
 *          core (`core/override-points/`).
 * Boundary: the override is a class whose options name the component. The module folder
 *           (`overrides/<module>/`) is omitted because the point is this package's own; an app
 *           overriding it writes `overrides/loyalty_kit/components/points-issued.override.tsx`.
 * Runtime: browser
 * Governing contract: ADR 0234 d9 (amended: `overrides/`)
 */
import { Override } from "@stackra/panel";
import { PointsIssuedTile } from "#core/override-points/points-issued-tile.point";
import { PointsIssued } from "#react/points-issued/points-issued";

/** Listed in the host's `.stackra/gen/overrides.ts` with this file as its source. */
@Override(PointsIssuedTile, { component: PointsIssued })
export class PointsIssuedOverride {}
