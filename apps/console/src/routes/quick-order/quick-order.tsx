/**
 * Stackra file contract:
 * Purpose: the quick-order page, bound to `QuickOrderRoute` by name: a variant picker over the
 *          generated search query, a quantity and optional points, posted to the route's `submit`.
 * Boundary: the form adapter (`@stackra/ui/form`) binds HeroUI fields to `QuickOrderForm`; field
 *           names are paths of that schema, checked by its type. The action, the redirect and the
 *           field errors are the route's.
 * Runtime: browser
 * Governing contract: ADR 0294 (decisions 7 and 14), ADR 0165 (form adapters), ADR 0139 (declared
 *                     UX)
 */
import { useTranslation } from "@stackra/i18n/react";
import type { RouteComponent } from "@stackra/navigation";
import { useSubmit } from "@stackra/navigation/react";
import { Button } from "@stackra/ui";
import { Field, Form, useSchemaForm } from "@stackra/ui/form";
import { I18n } from "#stackra/i18n";
import type { QuickOrderRoute } from "#src/routes/quick-order/quick-order.route";
import { QuickOrderForm } from "#src/schemas/quick-order-form.schema";
import { useVariantSearch } from "./use-variant-search";

/**
 * The picker searches through the generated query; the route validates again before calling the
 * service.
 */
export const QuickOrder: RouteComponent<typeof QuickOrderRoute> = () => {
  const { t } = useTranslation();
  const submit = useSubmit<typeof QuickOrderRoute>();
  const form = useSchemaForm(QuickOrderForm, {
    defaultValues: { lines: [{ variantId: "", quantity: 1 }], redeemPoints: 0 },
    serverErrors: submit.fieldErrors,
  });
  const variants = useVariantSearch(form.watch("lines.0.variantId"));
  return (
    <Form
      form={form}
      submit={submit}
      aria-label={t(I18n.orders.quick_order.title)}
      className="flex max-w-md flex-col gap-4"
    >
      <h1 className="text-xl font-semibold">{t(I18n.orders.quick_order.title)}</h1>
      <Field.ComboBox
        name="lines.0.variantId"
        label={t(I18n.orders.quick_order.variant)}
        items={variants.items}
        itemKey="variantId"
        itemLabel={(v) => `${v.sku} · ${v.title}`}
        isLoading={variants.isLoading}
        isRequired
      />
      <Field.Number
        name="lines.0.quantity"
        label={t(I18n.orders.quick_order.quantity)}
        minValue={1}
        maxValue={999}
      />
      <Field.Number
        name="redeemPoints"
        label={t(I18n.loyalty_kit.adjustment.points)}
        minValue={0}
      />
      <Button type="submit" isPending={submit.isPending}>
        {t(I18n.orders.quick_order.submit)}
      </Button>
    </Form>
  );
};
