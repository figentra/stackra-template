/**
 * Stackra file contract:
 * Purpose: the steps behind `orders.order.create`: price, reserve stock, create the pending order,
 *          authorize the payment. A later failure undoes the earlier steps in reverse.
 * Boundary: every public async method is a step, run in declaration order, whether or not it
 *           carries `@Step`; the decorator is written only to give a step options (here the payment
 *           call's retries), never to make it a step. `undo<Step>` compensates its step; `output`
 *           maps the results to the action's output. Each step is its own transaction, is
 *           idempotent on the run id and stores its result with the run, so a resume skips what is
 *           done. Started only by CreateOrderAction through `ctx.run`, never exposed directly;
 *           another module that needs to change a step's result uses the orders extension point,
 *           never a step of its own here.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 6, 16 and 18, as amended by programming model
 *                     v3.1, AGENTS.md), ADR 0101, ADR 0151, ADR 0152
 */
import type { PublicId } from "@stackra/contracts";
import { Backoff } from "@stackra/queue";
import { type Run, Step, type StepContext, Workflow } from "@stackra/workflow";
import type { AuthorizePaymentOutput, PaymentsClient } from "#stackra/clients/payments";
import type { StockService } from "#modules/inventory/services/stock.service";
import { CancelReason } from "#modules/orders/enums/cancel-reason.enum";
import { OrderStatus } from "#modules/orders/enums/order-status.enum";
import type { CreateOrderInput } from "#modules/orders/schemas/create-order-input.schema";
import { CreateOrderOutput } from "#modules/orders/schemas/create-order-output.schema";
import { PricedOrder } from "#modules/orders/schemas/priced-order.schema";
import type { OrderPricingService } from "#modules/orders/services/order-pricing.service";
import type { OrderService } from "#modules/orders/services/order.service";

/** Runs at most two minutes; the payment provider's retries fit inside it. */
export class CreateOrderWorkflow extends Workflow<CreateOrderInput>({ timeout: "2m" }) {
  /** Each step's collaborator; the payments client is the only remote call. */
  constructor(
    private readonly pricing: OrderPricingService,
    private readonly stock: StockService,
    private readonly orders: OrderService,
    private readonly payments: PaymentsClient,
  ) {
    super();
  }

  /** Draft, then both extension slots (verify before, totals after); no side effects, no undo. */
  async price(run: Run<this>, ctx: StepContext): Promise<PricedOrder> {
    const draft = await this.pricing.verify(await this.pricing.draft(run.input, ctx), ctx);
    return PricedOrder.create({ draft, totals: await this.pricing.price(draft, ctx) });
  }

  /**
   * Holds the stock before the row exists, so two customers cannot both buy the last unit.
   * @throws InsufficientStockError, which ends the run before anything needs undoing.
   */
  async reserveStock(run: Run<this>): Promise<void> {
    await this.stock.reserve(run.results.price.draft.lines);
  }

  /** Undoes `reserveStock`; safe to repeat, because a release never goes below zero. */
  async undoReserveStock(run: Run<this>): Promise<void> {
    await this.stock.release(run.results.price.draft.lines);
  }

  /** Writes the pending order; `order.placed` leaves through the outbox when this step commits. */
  async createOrder(run: Run<this>): Promise<PublicId<"ord">> {
    const { draft, totals } = run.results.price;
    return this.orders.createPending(draft, totals).id;
  }

  /** Undoes `createOrder`: the order stays as a cancelled row with reason `payment_failed`. */
  async undoCreateOrder(run: Run<this>): Promise<void> {
    const order = await this.orders.findOneOrFail({ id: run.results.createOrder });
    this.orders.cancel(order, CancelReason.PaymentFailed);
  }

  /**
   * The external call runs last; `ctx.stepKey` is the idempotency key, so a retry never
   * authorizes twice.
   * @throws Refusal the payments service's refusal (`card_declined`) after the last attempt, which
   *         starts the undo chain.
   */
  @Step({
    retry: {
      attempts: 3,
      backoff: Backoff.Exponential,
    },
  })
  async authorizePayment(run: Run<this>, ctx: StepContext): Promise<AuthorizePaymentOutput> {
    const orderId = run.results.createOrder;
    const { totals } = run.results.price;
    const authorization = await this.payments.payment.authorize.call(
      { reference: orderId, amountMinor: totals.totalMinor, currency: totals.currency },
      { idempotencyKey: ctx.stepKey },
    );
    await this.orders.attachPayment(orderId, authorization.paymentId);
    return authorization;
  }

  /** Undoes `authorizePayment` once a later step exists; a queued call, retried until done. */
  async undoAuthorizePayment(run: Run<this>): Promise<void> {
    await this.payments.payment.void.queue({ paymentId: run.results.authorizePayment.paymentId });
  }

  /** The action's output, built from the step results. */
  output(run: Run<this>): CreateOrderOutput {
    return CreateOrderOutput.create({
      orderId: run.results.createOrder,
      status: OrderStatus.PendingPayment,
      totals: run.results.price.totals,
      paymentClientSecret: run.results.authorizePayment.clientSecret,
    });
  }
}
