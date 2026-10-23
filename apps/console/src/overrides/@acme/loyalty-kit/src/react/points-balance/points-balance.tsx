/**
 * Stackra file contract:
 * Purpose: the console's shadow of @acme/loyalty-kit's `PointsBalance` renderer: a staff-facing KPI
 *          tile for the till (the balance as a counted figure, the tier as a chip and the exact
 *          date the oldest points expire, in the warning colour inside the kit's window) instead of
 *          the kit's customer card with its generic expiry note.
 * Boundary: a renderer shadow: it sits at the owner's own path under `src/overrides/<owner>/`, so
 *           gen binds it in place of the kit's renderer with no keyword; it exports the same name
 *           with the same `PointsBalanceProps`, imported from the kit's react entry (gen checks
 *           both, `override_shape_mismatch`, and lists it on a kit upgrade when the shadowed file
 *           changed). Presentation only: the data is the widget query's output and the warning rule
 *           is the kit's own `isExpiringSoon`. The tier label is the kit's derived enum key; the
 *           console's own words are `console::loyalty.*`. A class component; gen compiles it to a
 *           function component.
 * Runtime: browser
 * Governing contract: ADR 0294 (decision 14; as amended by programming model v3.1, AGENTS.md: the
 *                     central overrides tree and class components), ADR 0164, ADR 0080
 */
import { isExpiringSoon } from "@acme/loyalty-kit";
import type { PointsBalanceProps } from "@acme/loyalty-kit/react";
import { KPI } from "@stackra-pro/ui";
import { useDateTime, useNumber, useTranslation } from "@stackra/i18n/react";
import { Chip, Component, Description } from "@stackra/ui";
import { I18n } from "#stackra/i18n";

/** The balance as a KPI with the tier chip and the next expiry date. */
export class PointsBalance extends Component<PointsBalanceProps> {
  /** The translator of the active locale. */
  i18n = useTranslation();

  /** Formats a number in the user's locale and numerals. */
  number = useNumber();

  /** Formats a date in the user's locale and time zone. */
  formatDateTime = useDateTime();

  /** The clock, read once when the tile mounts: a thirty-day window needs no ticking time. */
  now = Date.now();

  /** True when the oldest live points expire within the kit's warning window. */
  get expiresSoon() {
    return isExpiringSoon(this.props.data?.nextExpiryAt, this.now);
  }

  /** The expiry line: the date of the oldest live points, or that none are waiting. */
  get expiry() {
    const next = this.props.data?.nextExpiryAt;
    if (!next) return this.i18n.t(I18n.console.loyalty.no_expiry);
    return this.i18n.t(I18n.console.loyalty.next_expiry, {
      date: this.formatDateTime(next, { dateStyle: "medium" }),
    });
  }

  /** The tile; while the first answer loads it shows the busy state with no figures. */
  render() {
    const { t } = this.i18n;
    const { data, isRefreshing } = this.props;
    return (
      <KPI aria-busy={isRefreshing || !data}>
        <KPI.Header>
          <KPI.Title>{t(I18n.console.loyalty.title)}</KPI.Title>
          {data && (
            <Chip size="sm" variant="soft">
              {t(I18n.loyalty_kit.enums.loyalty_tier[data.tier])}
            </Chip>
          )}
        </KPI.Header>
        <KPI.Value>
          {data ? t(I18n.console.loyalty.points, { count: this.number(data.balance) }) : null}
        </KPI.Value>
        {data && (
          <Description className={this.expiresSoon ? "text-warning" : undefined}>
            {this.expiry}
          </Description>
        )}
      </KPI>
    );
  }
}
