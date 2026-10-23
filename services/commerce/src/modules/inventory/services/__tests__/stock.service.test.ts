/**
 * Stackra file contract:
 * Purpose: proves reservation refuses past availability, records `stock.low` at the threshold, and
 *          releases idempotently.
 * Boundary: unit tier; the inventory module alone on memory drivers, settings faked, one level from
 *           the factory whose variant id every case reads back.
 * Runtime: node
 * Governing contract: ADR 0101, ADR 0149, ADR 0022
 */
import { createTestingModule, type TestingApp } from "@stackra/container/testing";
import type { PublicId } from "@stackra/contracts";
import { refusal } from "@stackra/errors/testing";
import { SettingsReader } from "@stackra/settings";
import { fakeSettings } from "@stackra/settings/testing";
import { beforeEach, describe, expect, it } from "@stackra/testing";
import { StockLevelFactory } from "#modules/inventory/database/factories/stock-level.factory";
import { InsufficientStockError } from "#modules/inventory/errors/insufficient-stock.error";
import { StockLow } from "#modules/inventory/events/stock-low.event";
import { InventoryModule } from "#modules/inventory/inventory.module";
import { InventorySettings } from "#modules/inventory/inventory.settings";
import { StockLevel } from "#modules/inventory/models/stock-level.model";
import { StockService } from "#modules/inventory/services/stock.service";

/** Guards stock reservation, where overselling or negative stock is a direct business loss. */
describe(StockService, () => {
  let app: TestingApp;
  let stock: StockService;
  let variantId: PublicId<"var">;

  /** Reserved units of the fixture level, read fresh from the repository. */
  const reserved = async () =>
    (await app.repository(StockLevel).findOneOrFail({ variantId })).reserved;

  /** Ten on hand for one variant, threshold 2, no backorders. */
  beforeEach(async () => {
    const settings = fakeSettings([
      [InventorySettings, { lowStockThreshold: 2, allowBackorders: false }],
    ]);
    app = await createTestingModule(InventoryModule)
      .useDrivers("memory")
      .override(SettingsReader, settings)
      .compile();
    ({ variantId } = await StockLevelFactory.new().create({ onHand: 10 }));
    stock = app.get(StockService);
  });

  /** Eleven of ten: the refusal must name the variant and leave the level untouched. */
  it("refuses to reserve more than is available", async () => {
    await expect(stock.reserve([{ variantId, quantity: 11 }])).rejects.toRefuseWith(
      refusal(InsufficientStockError),
    );
    expect(await reserved()).toBe(0);
  });

  /** Reserving eight leaves two, which is the threshold, so the event fires at the boundary. */
  it("records stock.low when a reservation reaches the threshold", async () => {
    await stock.reserve([{ variantId, quantity: 8 }]);
    await app.flush();
    expect(app.events.published()).toRecord(StockLow, { variantId, available: 2 });
  });

  /** An undo may run twice; reserved must clamp at zero rather than go negative. */
  it("releases idempotently", async () => {
    await stock.reserve([{ variantId, quantity: 3 }]);
    await stock.release([{ variantId, quantity: 3 }]);
    await stock.release([{ variantId, quantity: 3 }]);
    expect(await reserved()).toBe(0);
  });
});
