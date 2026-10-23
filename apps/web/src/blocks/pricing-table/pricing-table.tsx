/**
 * Stackra file contract:
 * Purpose: the plan ladder: one card per plan, a monthly/yearly toggle, prices in the market
 *          currency, limits and the trial line; enterprise shows "contact sales" instead of a
 *          price.
 * Boundary: the renderer of `PricingTableBlock`, bound by name; presentation over the query output.
 *           `data` is `billing.catalog.plan.list` (the block's `accepts`): the component never
 *           fetches. The interval and the money display are
 *           the hook's; the trial link is the site's signup URL, so it follows the environment.
 * Runtime: browser
 * Governing contract: ADR 0294 d14, ADR 0242 (plan ladders, 14-day trial), ADR 0220 (money)
 */
import type { QueryOutput } from "@stackra/clients";
import { useMoney, useTranslation } from "@stackra/i18n/react";
import { Link } from "@stackra/navigation/react";
import { Button, Card, Chip, ToggleButton, ToggleButtonGroup } from "@stackra/ui";
import { Enum } from "@stackra/validation";
import type { Billing } from "#stackra/clients";
import { I18n } from "#stackra/i18n";
import { Routes } from "#stackra/routes";
import { BillingInterval } from "#src/enums/billing-interval.enum";
import { useSite } from "#src/hooks/use-site";
import { useBillingInterval } from "./use-billing-interval";

/** Block props plus the bound query's output. */
export interface PricingTableProps {
  /** Output of `billing.catalog.plan.list`, fetched by the route or the renderer. */
  readonly data: QueryOutput<typeof Billing.queries.ListPlans>;
  /**
   * The product key the ladder belongs to; part of the trial link so billing knows which product to
   * start.
   */
  readonly product: string;
}

/**
 * A list of cards, not a table: each plan reads top to bottom on a phone and side by side on
 * desktop.
 */
export function PricingTable({ data, product }: PricingTableProps) {
  const { t } = useTranslation();
  const money = useMoney();
  const { signupUrl } = useSite();
  const { interval, setInterval, perMonth } = useBillingInterval();

  return (
    <section aria-labelledby="pricing-title" className="py-12">
      <h2 id="pricing-title" className="sr-only">
        {t(I18n.web.pricing.title)}
      </h2>
      <ToggleButtonGroup
        aria-label={t(I18n.web.pricing.interval)}
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={[interval]}
        onSelectionChange={(keys) => {
          const next = Enum.values(BillingInterval).find((code) => [...keys].includes(code));
          if (next) setInterval(next);
        }}
        className="mx-auto mb-8 w-fit"
      >
        {Enum.values(BillingInterval).map((option) => (
          <ToggleButton key={option} id={option}>
            {t(I18n.web.enums.billing_interval[option])}
            {option === BillingInterval.Year && (
              <Chip size="sm">{t(I18n.web.pricing.year_hint)}</Chip>
            )}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {data.plans.map((plan) => {
          const price = plan.prices[interval];
          const amount = price === null ? null : money(perMonth(price, plan.currency));
          const trial = new URL(signupUrl);
          trial.search = new URLSearchParams({
            product,
            plan: plan.key,
            interval,
          }).toString();
          return (
            <li key={plan.key} id={plan.key}>
              <Card variant={plan.highlighted ? "secondary" : "default"} className="h-full">
                <Card.Header>
                  <Card.Title>{plan.name}</Card.Title>
                  {plan.highlighted && (
                    <Chip color="accent">{t(I18n.web.pricing.highlighted)}</Chip>
                  )}
                </Card.Header>
                <Card.Content>
                  <p className="text-3xl font-semibold">
                    {amount === null
                      ? t(I18n.web.pricing.contact_sales)
                      : t(I18n.web.pricing.per_month, { amount })}
                  </p>
                  {amount !== null && (
                    <p className="mt-1 text-sm text-ink-muted">
                      {t(I18n.web.pricing.trial, { days: data.trialDays, amount })}
                    </p>
                  )}
                  <ul className="mt-4 space-y-1 text-sm">
                    {plan.limits.map((limit) => (
                      <li key={limit}>{limit}</li>
                    ))}
                  </ul>
                </Card.Content>
                <Card.Footer>
                  {amount === null ? (
                    <Button
                      variant="outline"
                      fullWidth
                      render={<Link to={Routes.contact} search={{ plan: plan.key }} />}
                    >
                      {t(I18n.web.pricing.contact_sales)}
                    </Button>
                  ) : (
                    <Button fullWidth render={<a href={trial.href} />}>
                      {t(I18n.web.pricing.start_trial)}
                    </Button>
                  )}
                </Card.Footer>
              </Card>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
