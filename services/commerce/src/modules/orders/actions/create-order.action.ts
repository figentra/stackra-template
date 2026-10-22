/**
 * Stackra file contract:
 * Purpose: `orders.order.create`: the only public way to place an order (HTTP, MCP, clients).
 * Boundary: the action is the contract (key, schemas, permission, UX, offline policy); the work
 *           runs in CreateOrderWorkflow because it crosses modules, calls the payments service and
 *           must compensate (ADR 0101). Callers never see the workflow. A service never names an
 *           app route: `UxAfter.OpenRecord` lets each client open its own order route
 *           (guides/programming-model.mdx#routes).
 * Runtime: node
 * Governing contract: ADR 0098, 0101, 0136, 0139, guides/programming-model.mdx#actions, ADR 0252
 */
import {
  Action,
  AsEndpoint,
  AsTool,
  ConflictResolution,
  Idempotency,
  IdMinting,
  OfflineMode,
  OfflinePrecondition,
  UxAfter,
} from "@stackra/actions";
import { ActorKind, HttpMethod } from "@stackra/contracts";
import { I18n } from "#stackra/i18n";
import { OrderPermissions } from "#modules/orders/permissions/order.permission";
import { CreateOrderInput } from "#modules/orders/schemas/create-order-input.schema";
import { CreateOrderOutput } from "#modules/orders/schemas/create-order-output.schema";
import { CreateOrderWorkflow } from "#modules/orders/workflows/create-order.workflow";
import { AcceptingOrdersGuard } from "#modules/orders/guards/accepting-orders.guard";

/**
 * Places an order for the acting customer. No `handle`: `runs` hands the validated input to the
 * workflow and returns its output through the same pipeline (guards, permission, idempotency,
 * rate limit, audit, UX). Its risk is `OrderPermissions.create`'s (ADR 0132). Offline clients may
 * queue it with a client-minted id for 72 hours; a conflict on replay is shown to the person, never
 * merged.
 */
@Action({
  key: "order.create", // gen prefixes the module key: `orders.order.create`
  input: CreateOrderInput,
  output: CreateOrderOutput,
  permission: OrderPermissions.create,
  actors: [ActorKind.User, ActorKind.Agent],
  guards: [AcceptingOrdersGuard], // refuses while the tenant has paused ordering
  // clients send Idempotency-Key; the pipeline stores key + hash + result
  idempotency: Idempotency.Required,
  rateLimit: { perMinute: 20 },
  runs: CreateOrderWorkflow,
  intents: ["order two of SKU-123", "buy these items"],
  offline: {
    mode: OfflineMode.Queue,
    idMinting: IdMinting.Client,
    precondition: OfflinePrecondition.None,
    retention: "72h",
    onConflict: [ConflictResolution.ServerWins, ConflictResolution.Manual],
  },
  // `queued` is the toast a client shows when it stores the call offline instead of sending it
  ux: {
    success: I18n.orders.order.placed,
    queued: I18n.orders.order.queued,
    after: [UxAfter.OpenRecord],
  },
})
@AsEndpoint({ method: HttpMethod.Post, path: "/orders" })
@AsTool() // agents may place orders for their user; L1, so no approval
export class CreateOrderAction {}
