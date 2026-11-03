/**
 * Stackra file contract:
 * Purpose: Vite config of @figentra/acme-console: one copy of React; Vite's own transform compiles the TSX. Imports use
 *          the `#` aliases of package.json, never an `@/` alias (ADR 0233).
 * Boundary: build configuration only; a stand-in for the tool config gen will write into `.stackra/` (ADR 0295
 *           decision 5), so it is the one authored config at the member root.
 * Runtime: node
 * Governing contract: ADR 0295 (decision 5); ADR 0165 (web client stack).
 */
import { defineConfig } from "vite";

// shortcut: no React or Tailwind plugin yet. The scaffold's @vitejs/plugin-react and @tailwindcss/vite are not in
// this repository's catalogs, and @stackra/vite-plugin (which wires both) pulls packages the workspace trustPolicy
// refuses (chokidar@4.0.3 and a pre-release rollup-plugin-off-main-thread). Add the preset,
// `stackra.viteConfig(app, { mode })`, once the owner clears those, or delete this file when gen writes
// `.stackra/vite.config.ts` for an app (STA-339).
export default defineConfig({ resolve: { dedupe: ["react", "react-dom"] } });
