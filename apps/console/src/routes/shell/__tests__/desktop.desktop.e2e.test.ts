/**
 * Stackra file contract:
 * Purpose: the packaged desktop app: boots on `app://`, exposes no Node to the renderer, blocks
 *          navigation, round-trips the receipt printer's bridge, and routes a deep link.
 * Boundary: the `desktop` Playwright project, `_electron.launch` against `dist/desktop-release`.
 *           The bridge is the one @stackra/peripherals ships behind its `ReceiptPrinter` port (the
 *           console writes no bridge); hardware is faked by the POS preset's test driver, and the
 *           updater is pointed at a local generic feed by the preset.
 * Runtime: node
 * Governing contract: ADR 0251 (hardening, bridge), ADR 0294 (decision 14), ADR 0182 (e2e lives in
 *                     the app, axe is the block)
 */
import { test, expect, launchDesktop, loginAs, axe } from "@stackra/testing/e2e";

/** The Electron shell must stay hardened and expose only declared bridges to the renderer. */
test("boots hardened, bridges a declared port, routes a deep link", async () => {
  const app = await launchDesktop({
    fakes: { "peripherals.receipt.print": { printer: "fake-escpos" } },
  });
  const window = await app.firstWindow();
  await loginAs(window, { role: "staff", tenant: "ten_1" });

  expect(window.url()).toMatch(/^app:\/\/bundle\//);
  await expect(await axe(window)).toHaveNoViolations();
  expect(await window.evaluate(() => typeof (globalThis as { require?: unknown }).require)).toBe(
    "undefined",
  );
  expect(
    await window.evaluate(
      () => typeof (globalThis as { stackra?: { invoke?: unknown; send?: unknown } }).stackra?.send,
    ),
  ).toBe("undefined"); // no passthrough

  await window.evaluate(() =>
    (globalThis as { location: Location }).location.assign("https://evil.example"),
  );
  expect(window.url()).toMatch(/^app:\/\/bundle\//); // will-navigate denied

  const result = await window.evaluate(() =>
    (
      globalThis as unknown as { stackra: { invoke: (k: string, i: unknown) => Promise<unknown> } }
    ).stackra.invoke("peripherals.receipt.print", {
      orderId: "ord_01JA0000000000000000000001",
      lines: ["Total 12.00"],
    }),
  );
  expect(result).toMatchObject({ ok: true, data: { printer: "fake-escpos" } });

  await app.openUrl("acme-console://orders/orders/ord_01JA0000000000000000000001");
  await expect(window.getByRole("heading", { level: 1 })).toHaveText(
    /ord_01JA0000000000000000000001/,
  );
  await app.close();
});
