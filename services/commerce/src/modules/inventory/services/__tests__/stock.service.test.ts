/**
 * Stackra file contract:
 * Purpose: proves reservation refuses past availability, records `stock.low` at the threshold, and
 *          releases idempotently.
 * Boundary: unit tier; the inventory module alone on memory drivers, settings faked, one row from
 *           the factory whose variant id every case reads back.
 * Runtime: node
 * Governing contract: ADR 0101, ADR 0022, guides/programming-model.mdx#services
 */
import { beforeEach, describe, expect, it } from "@stackra/testing";
import { refusal } from "@stackra/errors/testing";
import { createTestingModule, type TestingApp } from "@stackra/container/testing";
import { SettingsReader } from "@stackra/settings";
import { fakeSettings } from "@stackra/settings/testing";
import { Refusals } from "#stackra/manifest";
import { InventoryModule } from "#modules/inventory/inventory.module";
import { StockService } from "#modules/inventory/services/stock.service";
import { StockLevel } from "#modules/inventory/models/stock-level.model";
import { StockLow } from "#modules/inventory/events/stock-low.event";
import { InventorySettings } from "#modules/inventory/settings/inventory.setting";
import { StockLevelFactory } from "#modules/inventory/factories/stock-level.factory";

/** Guards stock reservation, where overselling or negative stock is a direct business loss. */
describe(StockService, () => {
  let app: TestingApp;
  let stock: StockService;
  let variantId: string;

  /** Reserved units of the fixture row, read fresh from the repository. */
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
    ({ variantId } = await new StockLevelFactory(app.em).createOne({ onHand: 10 }));
    stock = app.get(StockService);
  });

  /** Eleven of ten: the refusal must name the variant and leave the row untouched. */
  it("refuses to reserve more than is available", async () => {
    await expect(stock.reserve([{ variantId, quantity: 11 }])).rejects.toRefuseWith(
      refusal(Refusals.inventory.insufficient_stock),
    );
    expect(await reserved()).toBe(0);
  });

  /** Reserving eight leaves two, which is the threshold, so the event fires at the boundary. */
  it("records stock.low when a reservation reaches the threshold", async () => {
    await stock.reserve([{ variantId, quantity: 8 }]);
    await app.flush();
    expect(app.events.published()).toRecord(StockLow, { variantId, available: 2 });
  });

  /** A compensation may run twice; reserved must clamp at zero rather than go negative. */
  it("releases idempotently", async () => {
    await stock.reserve([{ variantId, quantity: 3 }]);
    await stock.release([{ variantId, quantity: 3 }]);
    await stock.release([{ variantId, quantity: 3 }]);
    expect(await reserved()).toBe(0);
  });
});
