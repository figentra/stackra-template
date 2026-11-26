/**
 * Stackra file contract:
 * Purpose: Vite config of @figentra/acme-console: one copy of React; Vite's own transform compiles the TSX. Imports use
 *          the `#` aliases of package.json, never an `@/` alias (ADR 0233). The dev and preview servers answer on both
 *          loopback addresses: Vite binds `localhost` to the one address it resolves first (::1 on most Linux and macOS
 *          machines), so a client or a port forwarder that dials 127.0.0.1 got nothing. `bothLoopbacks` listens on the
 *          same port of the other loopback address and hands its connections (HMR's WebSocket included) to Vite's own
 *          server. Nothing listens beyond loopback unless `--host` asks for it.
 * Boundary: build configuration only; a stand-in for the tool config gen will write into `.stackra/` (ADR 0295
 *           decision 5), so it is the one authored config at the member root.
 * Runtime: node
 * Governing contract: ADR 0295 (decision 5); ADR 0165 (web client stack); STA-2794 (the console answers on 127.0.0.1
 *                     and ::1).
 */
import type { Server as HttpServer } from "node:http";
import { createServer } from "node:net";

import { defineConfig, type Logger, type Plugin } from "vite";

/** The loopback address that pairs with each one. */
const OTHER_LOOPBACK: Readonly<Record<string, string>> = {
  "127.0.0.1": "::1",
  "::1": "127.0.0.1",
};

/** Bind errors meaning this machine lacks the address (no IPv6, say): there is nothing to pair with. */
const ABSENT = new Set(["EADDRNOTAVAIL", "EAFNOSUPPORT"]);

/** Once `server` listens on one loopback address, listens on the same port of the other and serves through it. */
function pairLoopback(server: HttpServer | null, logger: Logger): void {
  server?.once("listening", () => {
    const address = server.address();
    if (address === null || typeof address !== "object") return;
    const other = OTHER_LOOPBACK[address.address];
    // `--host`: a wildcard or a LAN address is already what was asked for.
    if (other === undefined) return;
    const twin = createServer((socket) => server.emit("connection", socket));
    twin.once("error", (error: NodeJS.ErrnoException) => {
      if (error.code === undefined || !ABSENT.has(error.code))
        logger.warn(`${other} port ${address.port} is not served: ${error.code ?? error.message}`);
    });
    twin.listen(address.port, other);
    server.once("close", () => twin.close());
  });
}

/** Serves the dev and preview servers on 127.0.0.1 and ::1 alike. */
function bothLoopbacks(): Plugin {
  return {
    name: "console:both-loopbacks",
    configureServer: (server) =>
      pairLoopback(server.httpServer as HttpServer | null, server.config.logger),
    configurePreviewServer: (server) =>
      pairLoopback(server.httpServer as HttpServer | null, server.config.logger),
  };
}

// shortcut: no React or Tailwind plugin yet. The scaffold's @vitejs/plugin-react and @tailwindcss/vite are not in
// this repository's catalogs, and @stackra/vite-plugin (which wires both) pulls packages the workspace trustPolicy
// refuses (chokidar@4.0.3 and a pre-release rollup-plugin-off-main-thread). Add the preset,
// `stackra.viteConfig(app, { mode })`, once the owner clears those, or delete this file when gen writes
// `.stackra/vite.config.ts` for an app (STA-339).
export default defineConfig({
  resolve: { dedupe: ["react", "react-dom"] },
  plugins: [bothLoopbacks()],
});
