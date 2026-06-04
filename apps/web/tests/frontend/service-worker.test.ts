import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const swSource = readFileSync(join(process.cwd(), 'public/sw.js'), 'utf8');

describe('service worker caching policy', () => {
  it('does not cache Next.js chunks or API responses', () => {
    expect(swSource).toContain("url.pathname.startsWith('/_next/')");
    expect(swSource).toContain("url.pathname.startsWith('/api/')");
  });

  it('forces updated service worker activation after cache policy changes', () => {
    expect(swSource).toContain('self.skipWaiting()');
    expect(swSource).toContain('self.clients.claim()');
  });
});
