import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');

// Source-contract checks; production build and HTTP image checks remain separate.
test('public OG image has a bounded PNG renderer with an unofficial label', () => {
  const path = 'app/opengraph-image.tsx';
  assert.ok(existsSync(new URL(path, root)), 'missing Open Graph image route');
  const image = read(path);
  assert.match(image, /ImageResponse/);
  assert.match(image, /width: 1200/);
  assert.match(image, /height: 630/);
  assert.match(image, /image\/png/);
  assert.match(image, /unofficial/i);
  assert.doesNotMatch(image, /\b(fetch|cookies|headers)\s*\(|process\.env/);
});
