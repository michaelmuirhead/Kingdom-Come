import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(__dirname, '..', '..');
const MANIFEST_PATH = resolve(ROOT, 'public', 'manifest.json');

describe('PWA manifest', () => {
  it('exists at /public/manifest.json', () => {
    expect(existsSync(MANIFEST_PATH)).toBe(true);
  });

  it('is valid JSON with the required fields', () => {
    const raw = readFileSync(MANIFEST_PATH, 'utf8');
    const manifest = JSON.parse(raw);
    expect(manifest.name).toBe('Kingdom Come');
    expect(manifest.short_name).toBeDefined();
    expect(manifest.start_url).toBe('/play');
    expect(manifest.display).toBe('fullscreen');
    expect(manifest.orientation).toBe('landscape-primary');
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(3);
  });

  it('declares 192x192, 512x512 (any), and 512x512 (maskable) icons', () => {
    const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
    const find = (size: string, purpose: string) =>
      manifest.icons.find(
        (i: { sizes: string; purpose: string }) =>
          i.sizes === size && i.purpose === purpose,
      );
    expect(find('192x192', 'any')).toBeDefined();
    expect(find('512x512', 'any')).toBeDefined();
    expect(find('512x512', 'maskable')).toBeDefined();
  });

  it('every referenced icon file exists on disk', () => {
    const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
    for (const icon of manifest.icons as Array<{ src: string }>) {
      const onDisk = resolve(ROOT, 'public', icon.src.replace(/^\//, ''));
      expect(existsSync(onDisk), icon.src).toBe(true);
    }
  });

  it('apple-touch-icon and favicon-32 are also present', () => {
    expect(
      existsSync(resolve(ROOT, 'public', 'icons', 'apple-touch-icon.png')),
    ).toBe(true);
    expect(
      existsSync(resolve(ROOT, 'public', 'icons', 'favicon-32.png')),
    ).toBe(true);
  });
});

describe('app/layout.tsx PWA metadata', () => {
  it('references the manifest and apple-web-app metadata', () => {
    const layout = readFileSync(resolve(ROOT, 'app', 'layout.tsx'), 'utf8');
    expect(layout).toContain("manifest: '/manifest.json'");
    expect(layout).toContain('appleWebApp');
    expect(layout).toContain('capable: true');
    expect(layout).toContain('apple-touch-icon');
  });

  it('viewport prevents pinch-zoom on the page chrome', () => {
    const layout = readFileSync(resolve(ROOT, 'app', 'layout.tsx'), 'utf8');
    expect(layout).toContain('userScalable: false');
    expect(layout).toContain('maximumScale: 1');
  });
});
