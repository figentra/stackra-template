#!/usr/bin/env node
/**
 * Stackra file contract:
 * Purpose: packs this template as the npm package @stackra/starter, the starter `stackra create` fetches (ADR 0515
 *          decision 3): every git-tracked file under `package/template/`, beside a generated `package/package.json`
 *          whose version is the `@stackra/*` line the template pins (`@stackra/cli` in pnpm-workspace.yaml), so a CLI
 *          release finds the starter of its own version.
 * Boundary: writes one gzipped tar (`stackra-starter-<version>.tgz`) into `--out` (default: the working directory) and
 *           prints `tarball=<path>` and `version=<v>` lines (GitHub step outputs); it never publishes. The tar is
 *           written here, not by `npm pack`, which would drop `.npmrc` and apply `.gitignore`: the starter must hold
 *           every tracked file exactly. Entries carry a fixed time, so the same tree packs to the same bytes.
 * Runtime: node (built-ins only; `git` on PATH)
 * Governing contract: Stackra ADR 0515 (decisions 3 and 5); ADR 0453 (the registry); ADR 0177 (npm distribution).
 *
 * Usage: `node .github/scripts/pack-starter.mjs [--out <dir>]` from the repository root.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";

/** The registry the starter is published to (ADR 0453). */
const REGISTRY = "https://registry.figentra.com/";

/** Where the template's files sit inside the package, so its own package.json never meets the starter's. */
const TEMPLATE_DIR = "template";

/** npm's fixed entry time (1985-10-26T08:15:00Z), so packing is reproducible. */
const MTIME = 499_162_500;

/**
 * The starter's version: the version the `stackra` catalog pins `@stackra/cli` to.
 * @param workspaceYaml - the text of pnpm-workspace.yaml.
 * @returns the version without a range operator.
 * @example
 * starterVersion('    "@stackra/cli": ^0.5.1\n'); // "0.5.1"
 */
function starterVersion(workspaceYaml) {
  const match = /^ {4}"@stackra\/cli": [\^~]?(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)\s*$/m.exec(
    workspaceYaml,
  );
  if (!match)
    throw new TypeError('pnpm-workspace.yaml pins no "@stackra/cli" version in catalog stackra');
  return match[1];
}

/**
 * The starter's own package.json.
 * @param version - the starter version.
 * @returns the manifest, ready for JSON.stringify.
 */
function starterManifest(version) {
  return {
    name: "@stackra/starter",
    version,
    private: false,
    description: `The Stackra starter that \`stackra create\` writes: the template's tracked files under ${TEMPLATE_DIR}/, with its profiles in ${TEMPLATE_DIR}/stackra.starter.yaml.`,
    keywords: ["stackra", "starter"],
    license: "MIT",
    repository: { type: "git", url: "git+https://github.com/figentra/stackra-template.git" },
    homepage: "https://docs.stackra.figentra.com",
    publishConfig: { registry: REGISTRY },
    stackra: {
      kind: "package",
      summary: "Read by `stackra create`; never installed into a workspace.",
    },
  };
}

/** A tar header number: octal, zero-padded, NUL-terminated. */
const octal = (value, width) => value.toString(8).padStart(width - 1, "0") + "\0";

/**
 * One ustar header block. A path over 100 bytes is split at a slash into `prefix` (155) and `name` (100).
 * @param path - the entry path.
 * @param size - the content length in bytes.
 * @param mode - the file mode.
 * @returns the 512-byte header.
 */
function header(path, size, mode) {
  const block = Buffer.alloc(512);
  let name = path;
  let prefix = "";
  if (Buffer.byteLength(path) > 100) {
    const cut = path.lastIndexOf("/", 155);
    if (cut < 0 || Buffer.byteLength(path.slice(cut + 1)) > 100)
      throw new RangeError(`path too long for a tar entry: ${path}`);
    prefix = path.slice(0, cut);
    name = path.slice(cut + 1);
  }
  block.write(name, 0, 100);
  block.write(octal(mode, 8), 100);
  block.write(octal(0, 8), 108);
  block.write(octal(0, 8), 116);
  block.write(octal(size, 12), 124);
  block.write(octal(MTIME, 12), 136);
  block.fill(" ", 148, 156);
  block.write("0", 156);
  block.write("ustar\0", 257);
  block.write("00", 263);
  block.write(prefix, 345, 155);
  let sum = 0;
  for (const byte of block) sum += byte;
  block.write(octal(sum, 7) + " ", 148);
  return block;
}

/**
 * A gzipped tar of `entries`, the npm tarball shape when every path starts with `package/`.
 * @param entries - each entry's path, content and mode (default 0o644).
 * @returns the .tgz bytes.
 */
function tarball(entries) {
  const parts = [];
  for (const { path, content, mode = 0o644 } of entries) {
    parts.push(header(path, content.length, mode), content);
    const pad = (512 - (content.length % 512)) % 512;
    if (pad > 0) parts.push(Buffer.alloc(pad));
  }
  parts.push(Buffer.alloc(1024));
  return gzipSync(Buffer.concat(parts), { level: 9 });
}

/**
 * The tracked files of the repository at `root`, with their modes.
 * @param root - the repository root.
 * @returns each file's path and mode, in git's order.
 */
function trackedFiles(root) {
  const out = execFileSync("git", ["ls-files", "-s", "-z"], { cwd: root, encoding: "utf8" });
  return (
    out
      .split("\0")
      .filter(Boolean)
      .map((line) => {
        const [meta, path] = line.split("\t");
        return { path, mode: meta.startsWith("100755") ? 0o755 : 0o644 };
      })
      // A tracked file deleted in the working tree is not packed.
      .filter(
        ({ path }) => statSync(join(root, path), { throwIfNoEntry: false })?.isFile() === true,
      )
  );
}

/** What the tests reach: the registry, the version and manifest of the starter, and the tarball writer. */
export const PACK_STARTER = { REGISTRY, starterVersion, starterManifest, tarball };

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const root = process.cwd();
  const at = process.argv.indexOf("--out");
  const out = resolve(at > 0 ? (process.argv[at + 1] ?? ".") : ".");
  const version = starterVersion(readFileSync(join(root, "pnpm-workspace.yaml"), "utf8"));
  const entries = [
    {
      path: "package/package.json",
      content: Buffer.from(`${JSON.stringify(starterManifest(version), null, 2)}\n`),
    },
    ...trackedFiles(root).map(({ path, mode }) => ({
      path: `package/${TEMPLATE_DIR}/${path}`,
      content: readFileSync(join(root, path)),
      mode,
    })),
  ];
  const file = join(out, `stackra-starter-${version}.tgz`);
  writeFileSync(file, tarball(entries));
  console.log(`tarball=${file}`);
  console.log(`version=${version}`);
}
