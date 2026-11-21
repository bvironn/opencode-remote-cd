// Generates the opencode-remote-cd mark. Glyphs are drawn as strokes, so the
// logo has no font dependency and survives any renderer.
// Usage: node logo.mjs  (writes into ../brand)
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'brand');

export const palette = {
  dark: { bg: '#191724', slash: '#7ee7c7', text: '#e0def4', dim: '#6e6a86', red: '#eb6f92' },
  light: { bg: '#faf4ed', slash: '#1f7a68', text: '#26233a', dim: '#797593', red: '#b4637a' },
};

// Shared geometry on a 512 grid.
const SW = 34; // stroke width of letters
const base = 352; // baseline
const xh = 150; // x-height (outer)
const r = (xh - SW) / 2; // bowl radius on stroke centre
const cy = base - xh / 2;

function glyphs({ slash, text }) {
  const cx1 = 262; // c
  const cx2 = 404; // d bowl
  // "c": arc opened to the right (±48° gap)
  const a = (48 * Math.PI) / 180;
  const sx = cx1 + r * Math.cos(a), sy1 = cy - r * Math.sin(a), sy2 = cy + r * Math.sin(a);
  const c = `M${sx.toFixed(1)} ${sy1.toFixed(1)} A${r} ${r} 0 1 0 ${sx.toFixed(1)} ${sy2.toFixed(1)}`;
  const stemX = cx2 + r;
  return `
  <path d="M96 ${base + 8} L196 ${base - 232}" stroke="${slash}" stroke-width="52" stroke-linecap="round"/>
  <path d="${c}" stroke="${text}" stroke-width="${SW}" stroke-linecap="round" fill="none"/>
  <circle cx="${cx2}" cy="${cy}" r="${r}" stroke="${text}" stroke-width="${SW}" fill="none"/>
  <path d="M${stemX} ${base - 216} V${base}" stroke="${text}" stroke-width="${SW}" stroke-linecap="round"/>`;
}

function mark({ bg, slash, text }, { rounded = 112 } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" role="img" aria-label="opencode-remote-cd">
  <title>opencode-remote-cd</title>
  ${bg ? `<rect width="512" height="512" rx="${rounded}" fill="${bg}"/>` : ''}
  <g transform="translate(-20 14)">${glyphs({ slash, text })}
  </g>
</svg>
`;
}

// Favicon: slash + prompt underscore only. Built on a 32 grid so it snaps at 16/32.
function favicon({ bg, slash, text }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <title>opencode-remote-cd</title>
  <rect width="32" height="32" rx="7" fill="${bg}"/>
  <path d="M9 25 L17 7" stroke="${slash}" stroke-width="4.5" stroke-linecap="round"/>
  <path d="M19.5 25 H25" stroke="${text}" stroke-width="3.5" stroke-linecap="round"/>
</svg>
`;
}

// Favicon that follows the OS theme when used directly as <link rel="icon">.
function faviconAdaptive() {
  const d = palette.dark, l = palette.light;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <title>opencode-remote-cd</title>
  <style>
    .bg{fill:${l.bg}} .s{stroke:${l.slash}} .t{stroke:${l.text}}
    @media (prefers-color-scheme: dark){ .bg{fill:${d.bg}} .s{stroke:${d.slash}} .t{stroke:${d.text}} }
  </style>
  <rect class="bg" width="32" height="32" rx="7"/>
  <path class="s" d="M9 25 L17 7" stroke-width="4.5" stroke-linecap="round"/>
  <path class="t" d="M19.5 25 H25" stroke-width="3.5" stroke-linecap="round"/>
</svg>
`;
}

export const markSvg = mark;
export const glyphSvg = glyphs;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync(join(out, 'logo-dark.svg'), mark(palette.dark));
  writeFileSync(join(out, 'logo-light.svg'), mark(palette.light));
  writeFileSync(join(out, 'logo.svg'), mark(palette.dark));
  writeFileSync(join(out, 'logo-mono.svg'), mark({ bg: null, slash: 'currentColor', text: 'currentColor' }).replace('<svg ', '<svg fill="none" color="#000" '));
  writeFileSync(join(out, 'logo-mono-white.svg'), mark({ bg: null, slash: '#fff', text: '#fff' }));
  writeFileSync(join(out, 'favicon.svg'), faviconAdaptive());
  writeFileSync(join(out, 'favicon-dark.svg'), favicon(palette.dark));
  writeFileSync(join(out, 'favicon-light.svg'), favicon(palette.light));
  console.log('logo svgs written');
}
