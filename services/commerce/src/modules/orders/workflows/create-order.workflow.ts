/**
 * Stackra file contract:
 * Purpose: the steps behind `orders.order.create`: price, reserve stock, create the pending order,
 *          authorize payment. A later failure undoes earlier steps through their compensations, in
 *          reverse.
 * Boundary: a declarative graph (ADR 0094). Steps run in declaration order unless `after` says
 *           otherwise; each step is its own transaction and is idempotent on the run id. Never
 *           exposed directly (ADR 0101).
 * Runtime: node
 * Governing contract: ADR 0094, 0101, 0151, 0152, guides/programming-model.mdx#workflows
 */
import { Backoff } from "@stackra/queue";
import { Step, Workflow, WorkflowBase, type StepContext } from "@stackra/workflow";
import { PaymentsClient } from "#stackra/clients";
import { StockService } from "#modules/inventory/services/stock.service";
import { OrderService } from "#modules/orders/services/order.service";
import { OrderPricingService } from "#modules/orders/services/order-pricing.service";
import type { CreateOrderInput } from "#modules/orders/schemas/create-order-input.schema";
import type { CreateOrderOutput } from "#modules/orders/schemas/create-order-output.schema";
import type { OrderDraft } from "#modules/orders/schemas/order-draft.schema";
import type { OrderTotals } from "#modules/orders/schemas/order-totals.schema";
import { CancelReason } from "#modules/orders/enums/cancel-reason.enum";
import { OrderStatus } from "#modules/orders/enums/order-status.enum";

/** Output of `price`; later steps read it as `s.price`. */
interface Priced {
  readonly draft: OrderDraft;
  readonly totals: OrderTotals;
}

/**
 * `output` maps step results to the action's declared output, so the workflow stays private to the
 * module.
 */
@Workflow({ timeout: "2m" })
export class CreateOrderWorkflow extends WorkflowBase<CreateOrderInput, CreateOrderOutput> {
  constructor(
    private readonly pricing: OrderPricingService,
    private readonly stock: StockService,
    private readonly orders: OrderService,
    private readonly payments: PaymentsClient,
  ) {
    super();
  }

  /** Draft, totals and the hook chains; no side effects, so no compensation. */
  @Step()
  async price(input: CreateOrderInput, ctx: StepContext): Promise<Priced> {
    const draft = await this.pricing.draft(input, ctx);
    await this.pricing.verify(draft, ctx);
    return { draft, totals: await this.pricing.price(draft, ctx) };
  }

  /**
   * Holds the stock before the row exists so two customers cannot both buy the last unit.
   * @throws InsufficientStockError, which ends the run before anything needs compensating.
   */
  @Step<CreateOrderWorkflow>({ input: (s) => s.price.draft.lines, compensate: "releaseStock" })
  async reserveStock(lines: OrderDraft["lines"]): Promise<OrderDraft["lines"]> {
    await this.stock.reserve(lines);
    return lines;
  }

  /** Compensation of `reserveStock`; safe to repeat (release never goes negative). */
  async releaseStock(lines: OrderDraft["lines"]): Promise<void> {
    await this.stock.release(lines);
  }

  /** Writes the pending order; `order.placed` leaves through the outbox when this step commits. */
  @Step<CreateOrderWorkflow>({ input: (s) => s.price, compensate: "cancelOrder" })
  async createOrder({ draft, totals }: Priced): Promise<{ id: string }> {
    return { id: (await this.orders.createPending(draft, totals)).id };
  }

  /**
   * Compensation of `createOrder`: the order stays as a cancelled row with reason `payment_failed`,
   * for support.
   */
  async cancelOrder(created: { id: string }): Promise<void> {
    await this.orders.cancel(
      await this.orders.findOneOrFail({ id: created.id }),
      CancelReason.PaymentFailed,
    );
  }

  /**
   * The external call runs last; `ctx.stepKey` is the idempotency key, so a retry never authorizes
   * twice.
   * @throws AppError the payments service's refusal (e.g. `card_declined`) after the last attempt,
   *   which triggers compensation.
   */
  @Step<CreateOrderWorkflow>({
    input: (s) => ({
      orderId: s.createOrder.id,
      amountMinor: s.price.totals.totalMinor,
      currency: s.price.totals.currency,
    }),
    retry: { attempts: 3, backoff: Backoff.Exponential },
    compensate: "voidPayment",
  })
  async authorizePayment(
    req: { orderId: string; amountMinor: number; currency: string },
    ctx: StepContext,
  ): Promise<{ paymentId: string; clientSecret: string }> {
    const intent = await this.payments.payment.authorize.call(
      { reference: req.orderId, amountMinor: req.amountMinor, currency: req.currency },
      { idempotencyKey: ctx.stepKey },
    );
    await this.orders.attachPayment(req.orderId, intent.paymentId);
    return intent;
  }

  /**
   * Compensation of `authorizePayment`, only reached if a later step is added after it; a command,
   * retried until done.
   */
  async voidPayment(auth: { paymentId: string }): Promise<void> {
    await this.payments.payment.void.queue({ paymentId: auth.paymentId });
  }

  /** The action's output, typed against CreateOrderOutput. */
  output(s: this["results"]): CreateOrderOutput {
    return {
      orderId: s.createOrder.id,
      status: OrderStatus.PendingPayment,
      totals: s.price.totals,
      paymentClientSecret: s.authorizePayment.clientSecret,
    };
  }
}
