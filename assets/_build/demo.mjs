// Records demo.html into ../demo/demo.gif and ../demo/storyboard.png.
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');

// file:// module imports need this flag in Chromium.
const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const page = await browser.newPage();
page.on('pageerror', (e) => { console.error(e); process.exit(1); });
await page.goto('file://' + join(here, 'demo.html') + '?record');
await page.waitForFunction(() => window.ready === true);
writeFileSync(join(here, '..', 'demo', 'demo.gif'), Buffer.from(await page.evaluate(() => window.buildGif()), 'base64'));
writeFileSync(join(here, '..', 'demo', 'storyboard.png'), Buffer.from(await page.evaluate(() => window.buildStoryboard()), 'base64'));
await browser.close();
console.log('demo.gif + storyboard.png written');
