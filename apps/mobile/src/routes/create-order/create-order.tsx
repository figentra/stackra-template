/**
 * Stackra file contract:
 * Purpose: the create-order sheet: variant (typed or scanned), quantity, optional loyalty points,
 *          submit.
 * Boundary: a class component bound to `CreateOrderRoute` by its file name, its props typed
 *           `RouteProps<typeof CreateOrderRoute>`. The form adapter (`@stackra/ui/native/form`)
 *           binds the UI kit's fields to `CreateOrderForm`. On success it replaces itself with the
 *           order; when queued it closes with the queued toast; a refusal stays on the sheet with
 *           the field error from the envelope. The scan button follows the quick-order flag.
 * Runtime: react-native
 * Governing contract: ADR 0294 (decisions 7 and 14, as amended by programming model v3.1,
 *                     AGENTS.md: class components), ADR 0059, ADR 0139, ADR 0165
 */
import { useFlag } from "@stackra/feature-flags/react";
import { useTranslation } from "@stackra/i18n/react";
import { type RouteProps, useNavigate } from "@stackra/navigation/native";
import { Button, Component, useToast } from "@stackra/ui/native";
import { Field, Form } from "@stackra/ui/native/form";
import { View } from "react-native";
import { Screen } from "#src/components/screen";
import type { CreateOrderRoute } from "#src/routes/create-order/create-order.route";
import { useCreateOrder } from "#src/routes/create-order/use-create-order";
import { Flags } from "#stackra/flags";
import { I18n } from "#stackra/i18n";
import { Routes } from "#stackra/routes";

/** The sheet; `params.variantId` arrives from the scanner. */
export class CreateOrder extends Component<RouteProps<typeof CreateOrderRoute>> {
  /** The translator of the active locale. */
  i18n = useTranslation();

  /** The toast region of the UI kit. */
  toasts = useToast();

  /** Typed navigation by route reference. */
  navigate = useNavigate();

  /** Whether the tenant's quick-order flag shows the scan entry. */
  canScan = useFlag(Flags.orders.quick_order);

  /** The form, the pending flag and the submit. */
  order = useCreateOrder(this.props.params.variantId);

  /** Submits; a queued call closes the sheet with a toast, a placed one opens the order. */
  async submit() {
    const result = await this.order.submit();
    if (!result) return;
    if ("queued" in result) {
      this.toasts.toast.show({
        variant: "accent",
        label: this.i18n.t(I18n.pages.create_order.queued),
      });
      this.navigate.back();
      return;
    }
    this.navigate.replace(Routes.order_detail, { orderId: result.orderId });
  }

  /** The form, the scan entry when the flag allows it, and the submit button. */
  render() {
    const { t } = this.i18n;
    return (
      <Screen testID="create-order-page">
        <Form form={this.order.form}>
          <Field.Text
            name="variantId"
            label={t(I18n.pages.create_order.variant)}
            description={t(I18n.pages.create_order.variant_hint)}
            autoCapitalize="none"
            isRequired
            testID="field-variant"
          />
          <View className="flex-row gap-3">
            <Field.Number
              name="quantity"
              label={t(I18n.pages.create_order.quantity)}
              minValue={1}
              className="flex-1"
              testID="field-quantity"
            />
            <Field.Number
              name="redeemPoints"
              label={t(I18n.pages.create_order.points)}
              minValue={0}
              className="flex-1"
              testID="field-points"
            />
          </View>
        </Form>
        {this.canScan ? (
          <Button variant="secondary" onPress={() => this.navigate.to(Routes.scan)}>
            {t(I18n.pages.create_order.scan)}
          </Button>
        ) : null}
        <Button
          onPress={() => void this.submit()}
          isDisabled={this.order.isPending}
          testID="create-order-submit"
        >
          {t(I18n.pages.create_order.submit)}
        </Button>
      </Screen>
    );
  }
}
