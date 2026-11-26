/**
 * Stackra file contract:
 * Purpose: proves the console's dev server, started from its own vite.config.ts as `pnpm run dev` starts it, answers
 *          on both loopback addresses: the page on 127.0.0.1 and on ::1 (when the machine has IPv6), and HMR's
 *          WebSocket on 127.0.0.1. Vite alone binds `localhost` to one of them, so a client or a port forwarder that
 *          dials the other got nothing (STA-2794).
 * Boundary: starts one Vite dev server of this process on a free loopback port and stops it; no file watcher.
 * Runtime: node
 * Governing contract: ADR 0022 (test placement); STA-2794 (the console answers on 127.0.0.1 and ::1).
 */
// @vitest-environment node
import { createServer as createNetServer } from "node:net";
import { fileURLToPath } from "node:url";

import { afterAll, beforeAll, describe, expect, it } from "@stackra/testing";
import { createServer, type ViteDevServer } from "vite";

/** The console member's folder. */
const ROOT = fileURLToPath(new URL("../..", import.meta.url));

let server: ViteDevServer;
let port: number;

/** The dev server's page at `host`, or the error code when nothing answers there. */
async function page(host: string): Promise<{ status: number; body: string } | string> {
  try {
    const response = await fetch(`http://${host}:${port}/`);
    return { status: response.status, body: await response.text() };
  } catch (error) {
    return String((error as { cause?: { code?: string } }).cause?.code ?? error);
  }
}

/** Whether this machine has the IPv6 loopback address. */
function hasIpv6Loopback(): Promise<boolean> {
  return new Promise((resolve) => {
    const probe = createNetServer();
    probe.once("error", () => resolve(false));
    probe.listen(0, "::1", () => probe.close(() => resolve(true)));
  });
}

beforeAll(async () => {
  server = await createServer({
    root: ROOT,
    configFile: `${ROOT}vite.config.ts`,
    logLevel: "silent",
    optimizeDeps: { noDiscovery: true },
    server: { port: 0, watch: null },
  });
  await server.listen();
  const address = server.httpServer?.address();
  port = typeof address === "object" && address !== null ? address.port : 0;
});

afterAll(async () => {
  await server?.close();
});

/** The console's dev server, as `pnpm run dev` serves it. */
describe("console dev server", () => {
  /** The page answers on 127.0.0.1, where a port forwarder dials. */
  it("serves the page on 127.0.0.1", async () => {
    const answer = await page("127.0.0.1");
    expect(answer).toMatchObject({ status: 200 });
    expect((answer as { body: string }).body).toContain("/@vite/client");
  });

  /** The page answers on ::1 too, where `localhost` resolves first on most machines. */
  it("serves the page on ::1 when the machine has IPv6", async (context) => {
    if (!(await hasIpv6Loopback())) {
      context.skip();
      return;
    }
    const answer = await page("[::1]");
    expect(answer).toMatchObject({ status: 200 });
    expect((answer as { body: string }).body).toContain("/@vite/client");
  });

  /** HMR's WebSocket upgrades through 127.0.0.1 as well, so live reload works for a forwarded port. */
  it("upgrades HMR's WebSocket on 127.0.0.1", async () => {
    const token = server.config.webSocketToken;
    const first = await new Promise<string>((resolve, reject) => {
      const socket = new WebSocket(`ws://127.0.0.1:${port}/?token=${token}`, "vite-hmr");
      socket.addEventListener("message", (event) => {
        socket.close();
        resolve(String(event.data));
      });
      socket.addEventListener("error", () => reject(new Error("no WebSocket on 127.0.0.1")));
    });
    expect(JSON.parse(first)).toMatchObject({ type: "connected" });
  });
});
