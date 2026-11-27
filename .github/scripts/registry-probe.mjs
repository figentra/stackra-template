#!/usr/bin/env node
/**
 * Stackra file contract:
 * Purpose: the Quality Gate's registry probe: whether the `@stackra/cli` version the `stackra` catalog pins is on the
 *          Stackra registry, so the install-based steps run. It fails closed: a registry or network error fails the
 *          job, and an unpublished pin passes (as `published=false`, the pre-release gate only) only while the
 *          workflow sets the explicit flag `STACKRA_PRE_RELEASE: "true"`.
 * Boundary: one `npm view` read; writes `published=true|false` to $GITHUB_OUTPUT (stdout when unset) and never edits a
 *           file. No token is read or printed here: npm reads the user-level ~/.npmrc that registry-auth wrote.
 * Runtime: node (built-ins only, so it runs before any install; `npm` on PATH)
 * Governing contract: Stackra ADR 0019 (supply-chain hardening: a check that cannot run fails), ADR 0453 (the
 *                     registry), ADR 0013 (versions only from catalogs). Issue: STA-2884.
 *
 * Usage: `STACKRA_PRE_RELEASE=false node .github/scripts/registry-probe.mjs` from the repository root.
 */
import { spawnSync } from "node:child_process";
import { appendFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

/** The registry the `@stackra` scope maps to in `.npmrc` (ADR 0453). */
const REGISTRY = "https://npm.stackra.figentra.com/";

/**
 * The exact `@stackra/cli` version catalog `stackra` pins.
 * @param workspaceYaml - the text of pnpm-workspace.yaml.
 * @returns the pinned version.
 * @throws TypeError when there is no pin, or the pin is a range (the catalog holds exact pins, ADR 0013).
 * @example
 * cliPin('    "@stackra/cli": 0.33.1\n'); // "0.33.1"
 */
function cliPin(workspaceYaml) {
  const line = /^ {4}"@stackra\/cli": *(\S+)\s*$/m.exec(workspaceYaml);
  if (!line) throw new TypeError('pnpm-workspace.yaml pins no "@stackra/cli" in catalog stackra');
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(line[1])) {
    throw new TypeError(
      `"@stackra/cli": ${line[1]} is not an exact version (ADR 0013: exact pins)`,
    );
  }
  return line[1];
}

/**
 * The explicit pre-release flag. Unset counts as "false"; any value other than "true" or "false" is refused, so a typo
 * never opens the gate.
 * @param value - the STACKRA_PRE_RELEASE environment value.
 * @returns whether an unpublished pin is accepted.
 * @throws TypeError for any other value.
 */
function preRelease(value) {
  if (value === undefined || value === "" || value === "false") return false;
  if (value === "true") return true;
  throw new TypeError(
    `STACKRA_PRE_RELEASE must be "true" or "false", not ${JSON.stringify(value)}`,
  );
}

/**
 * Classifies one `npm view <spec> version --json` run.
 * @param run - the spawn result: `status`, `stdout` and, when npm could not start, `error`.
 * @param version - the version asked for.
 * @returns `published` (npm answered that exact version), `unpublished` (the registry answered 404) or `error`
 *          (anything else: npm missing, a network or auth failure, a 5xx, an answer that is not that version), with
 *          the reason.
 */
function classify(run, version) {
  if (run.error) return { state: "error", reason: `npm could not run: ${run.error.message}` };
  let answer;
  try {
    answer = JSON.parse(run.stdout?.trim() || "null");
  } catch {
    return {
      state: "error",
      reason: `npm answered something other than JSON (exit ${run.status})`,
    };
  }
  if (run.status === 0) {
    if (answer === version) return { state: "published", reason: `${version} is on the registry` };
    return { state: "error", reason: `npm answered ${JSON.stringify(answer)}, not ${version}` };
  }
  const code = answer?.error?.code;
  const summary = answer?.error?.summary ?? "no detail";
  if (code === "E404") return { state: "unpublished", reason: summary };
  return { state: "error", reason: `${code ?? `npm exit ${run.status}`}: ${summary}` };
}

/**
 * What the gate does with a probe result.
 * @param result - the classified probe.
 * @param spec - the package spec probed, for the messages.
 * @param allowPreRelease - the explicit pre-release flag.
 * @returns `ok` (whether the job continues), `published` (whether the install-based steps run) and the message,
 *          with its GitHub annotation level.
 */
function decide(result, spec, allowPreRelease) {
  if (result.state === "published") {
    return {
      ok: true,
      published: true,
      level: "notice",
      message: `${spec} is on the registry; the full gate runs`,
    };
  }
  if (result.state === "unpublished" && allowPreRelease) {
    return {
      ok: true,
      published: false,
      level: "notice",
      message: `${spec} is not on the registry yet and STACKRA_PRE_RELEASE is "true"; only the pre-release gate runs`,
    };
  }
  if (result.state === "unpublished") {
    return {
      ok: false,
      published: false,
      level: "error",
      message: `${spec} is not on the registry (${result.reason}). Pin a published version in catalog stackra, or set STACKRA_PRE_RELEASE: "true" on the probe step in ci.yml while the framework is unpublished`,
    };
  }
  return {
    ok: false,
    published: false,
    level: "error",
    message: `the registry probe for ${spec} failed (${result.reason}); a probe error never skips the gate, re-run the job`,
  };
}

/** What the tests reach: the pin reader, the flag, the classifier and the decision. */
export const REGISTRY_PROBE = { REGISTRY, cliPin, preRelease, classify, decide };

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  let verdict;
  try {
    const version = cliPin(readFileSync(join(process.cwd(), "pnpm-workspace.yaml"), "utf8"));
    const allow = preRelease(process.env.STACKRA_PRE_RELEASE);
    const spec = `@stackra/cli@${version}`;
    const run = spawnSync("npm", ["view", spec, "version", "--json", "--registry", REGISTRY], {
      encoding: "utf8",
      env: {
        ...process.env,
        // A stalled request fails in 30 s and npm retries, as in preview-gate.mjs.
        npm_config_fetch_timeout: process.env.npm_config_fetch_timeout || "30000",
        npm_config_fetch_retries: process.env.npm_config_fetch_retries || "3",
        npm_config_update_notifier: "false",
      },
    });
    verdict = decide(classify(run, version), spec, allow);
  } catch (error) {
    verdict = { ok: false, published: false, level: "error", message: error.message };
  }
  console.log(`::${verdict.level} title=Registry probe::${verdict.message}`);
  const line = `published=${verdict.published}\n`;
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, line);
  else process.stdout.write(line);
  process.exit(verdict.ok ? 0 : 1);
}
