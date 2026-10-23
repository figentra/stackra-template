/**
 * Stackra file contract:
 * Purpose: `orders.order.create@1`: the only public way to place an order (HTTP, MCP, clients).
 * Boundary: the action is the contract: key, input and output (the types of `handle`), the
 *           precondition, idempotency, rate limit, offline policy and UX. The work runs in
 *           CreateOrderWorkflow because it crosses modules, calls the payments service and must
 *           compensate; callers never see the workflow. The permission is derived from the key
 *           (`OrderPermissions.create`, L1) and the endpoint is derived (`POST /orders`). A service
 *           never names an app route: `UxAfter.OpenRecord` lets each client open its own order
 *           route.
 * Runtime: node
 * Governing contract: ADR 0294 (decisions 3, 4, 5, 16 and 21), ADR 0098, ADR 0101, ADR 0136,
 *                     ADR 0138 (as amended), ADR 0139, ADR 0252
 */
import {
  Action,
  type ActionContext,
  ConflictResolution,
  Idempotency,
  IdMinting,
  OfflineMode,
  OfflinePrecondition,
  UxAfter,
} from "@stackra/actions";
import { ActorKind } from "@stackra/contracts";
import { AcceptingOrdersPrecondition } from "#modules/orders/access/accepting-orders.precondition";
import type { CreateOrderInput } from "#modules/orders/schemas/create-order-input.schema";
import type { CreateOrderOutput } from "#modules/orders/schemas/create-order-output.schema";
import { CreateOrderWorkflow } from "#modules/orders/workflows/create-order.workflow";

/**
 * Places an order for the acting customer. The pipeline runs tenancy, the permission, the
 * precondition (refuses while the tenant has paused ordering), idempotency (clients send
 * Idempotency-Key; the pipeline stores key, hash and result) and the rate limit before `handle`.
 * Offline clients may queue it with a client-minted id for 72 hours; a conflict on replay is shown
 * to the person, never merged. Agents may place orders for their user; L1, so no approval.
 */
export class CreateOrderAction extends Action({
  key: "order.create",
  actors: [ActorKind.User, ActorKind.Agent],
  preconditions: [AcceptingOrdersPrecondition],
  idempotency: Idempotency.Required,
  rateLimit: { perMinute: 20 },
  tool: true,
  intents: ["order two of SKU-123", "buy these items"],
  offline: {
    mode: OfflineMode.Queue,
    idMinting: IdMinting.Client,
    precondition: OfflinePrecondition.None,
    retention: "72h",
    onConflict: [ConflictResolution.ServerWins, ConflictResolution.Manual],
  },
  ux: { after: [UxAfter.OpenRecord] },
}) {
  /** Hands the validated input to the workflow and returns its output through the same pipeline. */
  async handle(input: CreateOrderInput, ctx: ActionContext): Promise<CreateOrderOutput> {
    return ctx.run(CreateOrderWorkflow, input);
  }
}
