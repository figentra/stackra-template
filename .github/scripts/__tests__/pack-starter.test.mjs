/**
 * Stackra file contract:
 * Purpose: tests of .github/scripts/pack-starter.mjs: the starter version comes from the `@stackra/cli` pin, the
 *          generated manifest is the public @stackra/starter on the Stackra registry, and the tarball is a valid
 *          gzipped ustar whose entries (a long path included) read back byte for byte.
 * Boundary: the pure functions only; the CLI run (git ls-files, writing the file) is exercised by the release job.
 * Runtime: node (`node --test ".github/scripts/__tests__/*.test.mjs"`, the `scripts` check of preview-gate.mjs)
 * Governing contract: Stackra ADR 0515 (decisions 3 and 5)
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { gunzipSync } from "node:zlib";

import { PACK_STARTER } from "../pack-starter.mjs";

const { REGISTRY, starterManifest, starterVersion, tarball } = PACK_STARTER;

/**
 * Reads a ustar archive back into its entries, checking each header's checksum.
 * @param tar - the uncompressed archive.
 * @returns each entry's path, mode and content.
 */
function untar(tar) {
  const entries = [];
  for (let at = 0; at + 512 <= tar.length;) {
    const block = tar.subarray(at, at + 512);
    if (block.every((byte) => byte === 0)) break;
    const text = (from, length) =>
      block.toString("utf8", from, from + length).replace(/\0.*$/s, "");
    const stored = Number.parseInt(text(148, 8).trim(), 8);
    let sum = 0;
    for (let i = 0; i < 512; i += 1) sum += i >= 148 && i < 156 ? 32 : block[i];
    assert.equal(sum, stored, "header checksum");
    assert.equal(text(257, 6), "ustar");
    const size = Number.parseInt(text(124, 12), 8);
    const prefix = text(345, 155);
    const name = text(0, 100);
    entries.push({
      path: prefix ? `${prefix}/${name}` : name,
      mode: Number.parseInt(text(100, 8), 8),
      content: tar.subarray(at + 512, at + 512 + size),
    });
    at += 512 + Math.ceil(size / 512) * 512;
  }
  return entries;
}

test("the version is the @stackra/cli pin of catalog stackra, without its range operator", () => {
  assert.equal(starterVersion('catalogs:\n  stackra:\n    "@stackra/cli": ^0.5.1\n'), "0.5.1");
  assert.equal(starterVersion('    "@stackra/cli": 1.2.3-next.4\n'), "1.2.3-next.4");
  assert.throws(() => starterVersion('    "@stackra/app": ^0.5.1\n'), TypeError);
});

test("the manifest is the public @stackra/starter, published to the Stackra registry", () => {
  const manifest = starterManifest("0.5.1");
  assert.equal(manifest.name, "@stackra/starter");
  assert.equal(manifest.version, "0.5.1");
  assert.equal(manifest.private, false);
  assert.deepEqual(manifest.publishConfig, { registry: REGISTRY });
  assert.equal(manifest.stackra.kind, "package");
});

test("the tarball is a gzipped ustar whose entries read back exactly", () => {
  const long = `package/template/${"nested/".repeat(16)}file.txt`;
  const entries = [
    { path: "package/package.json", content: Buffer.from('{"name":"@stackra/starter"}\n') },
    { path: "package/template/.npmrc", content: Buffer.from("@stackra:registry=x\n") },
    { path: long, content: Buffer.alloc(1300, 97), mode: 0o755 },
    { path: "package/template/empty", content: Buffer.alloc(0) },
  ];
  const read = untar(gunzipSync(tarball(entries)));
  assert.deepEqual(
    read.map((entry) => entry.path),
    entries.map((entry) => entry.path),
  );
  for (const [index, entry] of entries.entries()) {
    assert.deepEqual(read[index].content, entry.content);
    assert.equal(read[index].mode, entry.mode ?? 0o644);
  }
});

test("the same entries pack to the same bytes", () => {
  const entries = [{ path: "package/a", content: Buffer.from("a") }];
  assert.deepEqual(tarball(entries), tarball(entries));
});
