// Renders an HTML or SVG file to PNG with headless Chromium (playwright-core).
// Usage: node render.mjs <in.(svg|html)> <out.png> <width> <height> [scale] [theme]
// SVGs are scaled to fill width×height. HTML gets ?theme=<theme> appended.
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');

const [, , input, out, w, h, scale = '1', theme = 'dark'] = process.argv;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: +scale });
const url = 'file://' + resolve(input);
if (input.endsWith('.svg')) {
  // Open the SVG itself (file:// images are blocked from about:blank) and resize its root.
  await page.goto(url);
  await page.evaluate(([w, h]) => { const r = document.documentElement; r.setAttribute('width', w); r.setAttribute('height', h); }, [w, h]);
} else {
  await page.goto(`${url}?theme=${theme}`);
  await page.evaluate(() => document.fonts.ready);
}
await page.screenshot({ path: out, omitBackground: true, clip: { x: 0, y: 0, width: +w, height: +h } });
await browser.close();
