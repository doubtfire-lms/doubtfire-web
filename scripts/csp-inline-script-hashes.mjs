#!/usr/bin/env node
// Emit the CSP script-src source expressions for the inline <script> elements
// of a built index.html, space separated, e.g. 'sha256-abc...' 'sha256-def...'
//
// With subresourceIntegrity enabled, Angular emits an inline importmap listing
// the integrity hash of every chunk. Its own hash therefore changes with every
// build and cannot be pinned by hand in a CSP, so nginx.conf takes it from here
// at image build time (see deploy.Dockerfile).
//
// Usage: node scripts/csp-inline-script-hashes.mjs dist/browser/index.html

import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';

const indexPath = process.argv[2];

if (!indexPath) {
  console.error('usage: csp-inline-script-hashes.mjs <path-to-index.html>');
  process.exit(1);
}

const html = readFileSync(indexPath, 'utf8');

// Inline scripts only: a src= attribute anywhere in the open tag disqualifies it.
const inlineScript = /<script(?![^>]*\ssrc\s*=)([^>]*)>([\s\S]*?)<\/script>/gi;

// Types the browser executes, or parses under script-src in the importmap case.
// Anything else is an inert data block that CSP ignores.
const executedTypes = ['importmap', 'module', 'text/javascript', 'application/javascript'];

const hashes = [];

for (const [, attrs, body] of html.matchAll(inlineScript)) {
  const type = /\stype\s*=\s*["']?([^"'\s>]+)/i.exec(attrs)?.[1]?.toLowerCase();
  if (type && !executedTypes.includes(type)) continue;
  if (body.trim() === '') continue;

  // CSP hashes the exact bytes between the tags, unmodified.
  const source = `'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`;
  if (!hashes.includes(source)) hashes.push(source);
}

// No inline scripts is legitimate when subresourceIntegrity is off, but if the
// importmap is present and we matched nothing, the parse is wrong - failing
// here beats shipping a policy that blocks the app.
if (hashes.length === 0 && html.includes('type="importmap"')) {
  console.error(`${indexPath} contains an importmap but no inline script was matched`);
  process.exit(1);
}

process.stdout.write(hashes.join(' '));
