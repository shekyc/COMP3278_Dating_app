import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const root = new URL('../', import.meta.url);
const primary = JSON.parse(readFileSync(new URL('public/profiles/manifest.json', root)));
const galleries = JSON.parse(readFileSync(new URL('public/profiles/gallery-manifest.json', root)));
assert.equal(primary.length, 64);
assert.equal(primary.filter((p) => p.presentation === 'feminine').length, 32);
assert.equal(primary.filter((p) => p.presentation === 'masculine').length, 32);
const extra = Array.isArray(galleries) ? galleries : Object.values(galleries).flat();
assert.equal(extra.length, 6);
const hashes = new Set();
let size = 0;
for (const p of [...primary, ...extra]) {
  const path = p.path;
  assert.ok(path.startsWith('/profiles/'));
  const file = new URL('public' + path, root);
  assert.ok(existsSync(file), path);
  const data = readFileSync(file);
  assert.equal(data.toString('ascii', 0, 4), 'RIFF');
  assert.equal(data.toString('ascii', 8, 12), 'WEBP');
  const hash = createHash('sha256').update(data).digest('hex');
  assert.equal(hash, p.sha256, path);
  assert.ok(!hashes.has(hash), 'Duplicate image data');
  hashes.add(hash);
  assert.equal(data.length, p.bytes);
  assert.ok(p.width >= 800 && p.height >= 1000);
  size += data.length;
}
console.log(
  `PASS: ${primary.length} primary portraits + ${extra.length} gallery portraits; unique hashes, valid WebP headers, manifest dimensions, ${(size / 1024 / 1024).toFixed(2)} MiB.`,
);
