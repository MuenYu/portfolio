import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const tempDir = await mkdtemp(path.join(tmpdir(), 'canonical-loader-'));
const outfile = path.join(tempDir, 'root-loader.js');

await build({
  bundle: true,
  entryPoints: [path.resolve('app/root.loader.ts')],
  format: 'esm',
  outfile,
  platform: 'node',
  sourcemap: false,
  target: ['es2022'],
});

const { loader } = await import(pathToFileURL(outfile).href);

const context = {
  cloudflare: {
    env: {
      SESSION_SECRET: 'test-secret',
    },
  },
};

async function getCanonical(url) {
  const response = await loader({
    request: new Request(url),
    context,
  });

  const body = await response.json();
  return body.canonicalUrl;
}

test('normalizes trailing slashes for canonical URLs', async () => {
  const rootCanonical = await getCanonical('https://example.com/');
  const canonical = await getCanonical('https://example.com/projects/');

  assert.equal(canonical, new URL('projects', rootCanonical).toString());
});

test('keeps canonical value when no trailing slash is present', async () => {
  const rootCanonical = await getCanonical('https://example.com/');
  const canonical = await getCanonical('https://example.com/projects');

  assert.equal(canonical, new URL('projects', rootCanonical).toString());
});

test('retains the canonical root path', async () => {
  const canonical = await getCanonical('https://example.com/');

  assert.ok(canonical.endsWith('/'));
  assert.equal(new URL(canonical).pathname, '/');
});
