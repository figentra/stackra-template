/**
 * Stackra file contract:
 * Purpose: unit tests of the wiring gen writes for this service (`.stackra/gen/wiring.ts`): a deployed server can serve
 *          a note only when the action pipeline's tenant ports are bound, `CallIsolation` (the transaction that sets
 *          `app.tenant_id`), `TenancyCheck` (the tenant may act now) and `UnitOfWork` (a nested call joins the open
 *          transaction). The pipeline reads each one as optional, so a missing binding is silent:
 *          without `CallIsolation` a call runs with no tenant and the forced row policy shows no note and refuses every
 *          write.
 * Boundary: test only; reads the generated wiring, never a container. Each check is `it.fails` while core gen does not
 *           bind the port (STA-2807): it records the known gap, and it fails on the first core bump that closes the
 *           gap, so the `.fails` is then removed. The integration tests bind these drivers by hand, so they prove the
 *           service's behaviour under the ports, not that the server has them. `IdempotencyStore` is not checked: the
 *           template's pin (0.15.0) leaves it unbound too, but core gen binds it since STA-2573, so a `stackra create`
 *           app on core main has it and an `it.fails` would break there.
 * Runtime: node (vitest)
 * Governing contract: ADR 0263 (gen writes the wiring); ADR 0138 as amended (the pipeline's steps); ADR 0239 (tenant
 *                     isolation); STA-1699 (the CallIsolation port); STA-2807 (gen binds the tenant ports).
 */
import { CallIsolation, TenancyCheck, UnitOfWork } from "@stackra/actions/contracts";
import { Database } from "@stackra/database";
import { describe, expect, it } from "@stackra/testing";

import { wiring } from "#stackra/wiring";

/** A port class: an abstract token a driver implements. */
type Port = abstract new (...args: never[]) => unknown;

/** Whether the generated wiring gives `port` a driver: a driver table for it, or a binding that provides it. */
function bound(port: Port): boolean {
  const provides = (type: unknown): boolean =>
    type === port ||
    (typeof type === "function" && (type as { prototype: unknown }).prototype instanceof port);
  return (
    wiring.drivers.some((driver) => driver.port === port) ||
    wiring.bindings.some((binding) => provides(binding.provide))
  );
}

/** The pipeline ports a tenant-owned service needs in a deployed server. */
describe("the generated wiring of the notes service", () => {
  /** The check sees a port gen does bind, so a pass of the gaps below is never a broken check. */
  it("finds a port gen binds today", () => {
    expect(bound(Database)).toBe(true);
  });

  // Known gap, STA-2807: remove `.fails` when the template's core pin binds the port.
  it.fails("binds CallIsolation, so a call runs under its tenant", () => {
    expect(bound(CallIsolation)).toBe(true);
  });

  // Known gap, STA-2807.
  it.fails("binds TenancyCheck, so a suspended or misplaced tenant is refused", () => {
    expect(bound(TenancyCheck)).toBe(true);
  });

  // Known gap, STA-2807.
  it.fails("binds UnitOfWork, so a nested call joins the open transaction", () => {
    expect(bound(UnitOfWork)).toBe(true);
  });
});
