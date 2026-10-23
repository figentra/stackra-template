/**
 * Stackra file contract:
 * Purpose: the create-order sheet: variant (typed or scanned), quantity, optional loyalty points,
 *          submit.
 * Boundary: a function component bound to `CreateOrderRoute` by its file name. The form adapter
 *           (`@stackra/ui/native/form`) binds the UI kit's fields to `CreateOrderForm`. On success
 *           it replaces itself with the order; when queued it closes with the queued toast; a
 *           refusal stays on the sheet with the field error from the envelope. The scan button
 *           follows the quick-order flag.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decisions 7 and 14), ADR 0059, ADR 0139, ADR 0165
 */
import { useFlag } from "@stackra/feature-flags/react";
import { useTranslation } from "@stackra/i18n/react";
import { type RouteComponent, useNavigate } from "@stackra/navigation/native";
import { Button, useToast } from "@stackra/ui/native";
import { Field, Form } from "@stackra/ui/native/form";
import { View } from "react-native";
import { Screen } from "#src/components/screen";
import type { CreateOrderRoute } from "#src/routes/create-order/create-order.route";
import { useCreateOrder } from "#src/routes/create-order/use-create-order";
import { Flags } from "#stackra/flags";
import { I18n } from "#stackra/i18n";
import { Routes } from "#stackra/routes";

/** The sheet; `params.variantId` arrives from the scanner. */
export const CreateOrder: RouteComponent<typeof CreateOrderRoute> = ({ params }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const canScan = useFlag(Flags.orders.quick_order);
  const { form, isPending, submit } = useCreateOrder(params.variantId);

  const onSubmit = async () => {
    const result = await submit();
    if (!result) return;
    if ("queued" in result) {
      toast.show({ variant: "accent", label: t(I18n.mobile.create_order.queued) });
      navigate.back();
      return;
    }
    navigate.replace(Routes.order_detail, { orderId: result.orderId });
  };

  return (
    <Screen testID="create-order-page">
      <Form form={form}>
        <Field.Text
          name="variantId"
          label={t(I18n.mobile.create_order.variant)}
          description={t(I18n.mobile.create_order.variant_hint)}
          autoCapitalize="none"
          isRequired
          testID="field-variant"
        />
        <View className="flex-row gap-3">
          <Field.Number
            name="quantity"
            label={t(I18n.mobile.create_order.quantity)}
            minValue={1}
            className="flex-1"
            testID="field-quantity"
          />
          <Field.Number
            name="redeemPoints"
            label={t(I18n.mobile.create_order.points)}
            minValue={0}
            className="flex-1"
            testID="field-points"
          />
        </View>
      </Form>
      {canScan ? (
        <Button variant="secondary" onPress={() => navigate.to(Routes.scan)}>
          {t(I18n.mobile.home.scan)}
        </Button>
      ) : null}
      <Button onPress={onSubmit} isDisabled={isPending} testID="create-order-submit">
        {t(I18n.mobile.create_order.submit)}
      </Button>
    </Screen>
  );
};
