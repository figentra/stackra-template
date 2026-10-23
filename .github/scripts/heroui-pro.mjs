#!/usr/bin/env node
/**
 * Stackra file contract:
 * Purpose: guards the HeroUI Pro install (the console's `@heroui-pro/react`, Stackra ADR 0197 as
 *          amended). The package's postinstall reads only `HEROUI_AUTH_TOKEN`; without it the
 *          postinstall exits 0 and leaves an empty shell (the published tarball holds only its
 *          package.json, README and the postinstall), so an install "succeeds" with no components.
 *          `token` fails before the install when the token is missing; `installed` fails after it
 *          when the package still holds nothing but the shell.
 * Boundary: reads the environment and the console's node_modules; never prints, logs or writes the
 *           token. Used by `pnpm install:pro` (locally, inside `infisical run`, which exposes
 *           Infisical's HEROUI_PERSONAL_TOKEN as HEROUI_AUTH_TOKEN) and by release.yml (CI, after the
 *           Infisical OIDC step).
 * Runtime: node (built-ins only, so it runs before and after any install)
 * Governing contract: Stackra ADR 0197 as amended (stackra#127), Stackra ADR 0173 (secret values
 *                     only in Infisical)
 *
 * Usage: `node .github/scripts/heroui-pro.mjs token` | `node .github/scripts/heroui-pro.mjs installed`
 */
import { existsSync, readdirSync, realpathSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

/** The member that depends on HeroUI Pro, from the repository root. */
const MEMBER = "apps/console";

/** The package whose postinstall downloads the licensed components. */
const PACKAGE = "@heroui-pro/react";

/** The postinstall's own folder inside the package: present in the empty shell too. */
const SHELL_FOLDER = join("dist", "postinstall");

/**
 * Fail the process with one line on stderr.
 * @param message - what is wrong and what to run instead; never a secret.
 */
function fail(message) {
  console.error(`heroui-pro: ${message}`);
  process.exit(1);
}

/**
 * Count the JavaScript files under a folder, skipping the postinstall's own folder.
 * @param root - the package folder.
 * @param folder - the folder being walked.
 */
function componentFiles(root, folder = root) {
  let count = 0;
  for (const entry of readdirSync(folder)) {
    const path = join(folder, entry);
    const inPackage = relative(root, path);
    if (inPackage === SHELL_FOLDER || inPackage.startsWith(`${SHELL_FOLDER}${sep}`)) continue;
    if (entry === "node_modules") continue;
    if (statSync(path).isDirectory()) count += componentFiles(root, path);
    else if (/\.(c|m)?js$/.test(entry)) count += 1;
  }
  return count;
}

/** Fails when the token the postinstall reads is missing or blank. */
function token() {
  if ((process.env.HEROUI_AUTH_TOKEN ?? "").trim() === "") {
    fail(
      "HEROUI_AUTH_TOKEN is not set, so the HeroUI Pro postinstall would install an empty package. " +
        "Run `pnpm install:pro` (it reads HEROUI_PERSONAL_TOKEN from Infisical), or in CI run the " +
        "Infisical OIDC step first.",
    );
  }
}

/** Fails when the console's HeroUI Pro package holds only the published shell. */
function installed() {
  const link = join(MEMBER, "node_modules", PACKAGE);
  if (!existsSync(link)) fail(`${PACKAGE} is not installed in ${MEMBER}.`);
  const root = realpathSync(link);
  if (componentFiles(root) === 0) {
    fail(
      `${PACKAGE} holds only its postinstall: the licensed components were not downloaded. ` +
        "Check that HEROUI_AUTH_TOKEN carried a valid licence token, then reinstall with " +
        "`pnpm install:pro`.",
    );
  }
}

const CHECKS = { token, installed };
const [mode] = process.argv.slice(2);
if (!(mode in CHECKS))
  fail(`unknown check "${mode ?? ""}"; use one of: ${Object.keys(CHECKS).join(", ")}`);
CHECKS[mode]();
