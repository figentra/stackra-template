#!/usr/bin/env node
/**
 * Stackra file contract:
 * Purpose: the example-member drift check, run by `pnpm validate` after `stackra validate`: each example member
 *          (`services/example`) must equal what `stackra new` writes for it today; the example package carries the
 *          entries the OS shells load, so it is no longer generated as it is.
 *          It runs `stackra new <kind> <name> ... --over` per example, which writes any missing file and prints a
 *          line diff for each authored file that differs from the template; any written file or diff fails.
 * Boundary: the examples and their `stackra new` arguments are listed in EXAMPLES; an example whose folder is gone
 *           (the product deleted or renamed it) is skipped, so a product that has replaced the examples passes.
 *           `--over` never writes or diffs CHANGELOG.md or runway.yaml (stackra-71), so those are not checked.
 * Runtime: node (built-ins only; `stackra` from the workspace install)
 * Governing contract: stackra-15 (STA-1068: the examples are generated, not hand-written); STA-1210 (`stackra new
 *                     --over`); ADR 0349 (decision 2: product package names from the root runway's product key)
 *
 * Usage: `node .github/scripts/example-drift.mjs` from the repository root.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";

/** Each example: its folder and the `stackra new` arguments that wrote it (product scope from runway.yaml). */
const EXAMPLES = [
  {
    folder: "services/example",
    args: [
      "service",
      "example",
      "--area",
      "app",
      "--description",
      "An example service: rename it to the product's first service or delete it.",
    ],
  },
  // packages/application/example is not here: it carries the hand-written console, native and landing entries the
  // OS shells load (STA-1604), so it no longer equals what `stackra new package` writes.
];

/**
 * The drift lines in the output of `stackra new --over`: a `--- <file> (authored, kept)` diff header or a
 * `wrote <file>` line for a file that was missing.
 * @param output - stdout of one `stackra new --over` run.
 * @returns the lines that show drift, empty when the member equals the template.
 * @example
 * driftOf("regenerated services/example\n"); // []
 */
export function driftOf(output) {
  return output.split("\n").filter((line) => line.startsWith("--- ") || line.startsWith("wrote "));
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  let failed = false;
  for (const { folder, args } of EXAMPLES) {
    if (!existsSync(folder)) {
      console.log(`skip ${folder}: not in this repository`);
      continue;
    }
    const result = spawnSync("pnpm", ["exec", "stackra", "new", ...args, "--over"], {
      encoding: "utf8",
    });
    const drift = result.status === 0 ? driftOf(result.stdout) : [];
    if (result.status !== 0 || drift.length > 0) {
      failed = true;
      console.error(`${folder} drifted from \`stackra new\`:\n${result.stdout}${result.stderr}`);
    } else console.log(`ok ${folder}`);
  }
  process.exit(failed ? 1 : 0);
}
