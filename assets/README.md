# Brand assets

Identity for `opencode-remote-cd`, a community plugin for the OpenCode TUI. Not
affiliated with or endorsed by OpenCode. Nothing here uses OpenCode's logo,
wordmark or colors.

## Idea

A path that crosses a border and arrives intact:

```text
C:\root\projects  →  /root/projects
```

The slash is the hero glyph. The mark is `/cd`: a mint slash and a plain
`cd`, drawn as strokes so it has no font dependency. The drive letter appears
only in supporting assets, struck through. The bug is the villain, not the
user.

## Files

| Path | What | Use |
| --- | --- | --- |
| `brand/logo.svg` | Mark, dark (default) | README, docs, avatars |
| `brand/logo-dark.svg` · `-512.png` · `-1024.png` | Dark tile | GitHub avatar, npm, dark UIs |
| `brand/logo-light.svg` · `-512.png` · `-1024.png` | Light tile | Light UIs, print |
| `brand/logo-mono.svg` | One color, `currentColor`, no tile | Embossing, inline icons, stamps |
| `brand/logo-mono-white.svg` | One color, white | Over photos or colored fields |
| `brand/logo-mono-512.png` · `-1024.png` | Black on transparent | Where SVG is not accepted |
| `brand/favicon.svg` | Follows `prefers-color-scheme` | `<link rel="icon">` |
| `brand/favicon-dark.svg` · `favicon-light.svg` | Fixed theme | When the scheme is known |
| `brand/favicon.ico` | 16 / 32 / 48 | Legacy browsers |
| `brand/favicon-16/32/48.png`, `apple-touch-icon.png` | Raster icons | Platforms that need PNG |
| `readme/hero-dark.png` · `hero-light.png` | 1600×880 (800px @2x) | README hero via `<picture>` |
| `demo/demo.gif` | Flow A, 960×600, ~13.5 s, loops | README, site, social posts |
| `demo/storyboard.png` | The 7 beats of flow A | Review, recording a real capture |
| `social/npm-banner.png` | 1200×400 | npm / package listings |
| `social/social-preview.png` | 1280×640 | GitHub → Settings → Social preview |
| `../site/index.html` | One-page site | GitHub Pages from the repo root |

## Mark

- **Small sizes.** At 16–32px the mark drops `cd` and becomes a slash plus a
  prompt underscore (`/_`). Use the favicon files, not a scaled-down logo.
- **Clear space.** Keep at least the slash's stroke width (≈10% of the tile)
  free around the tile.
- **Single color.** `logo-mono.svg` inherits `currentColor`; set `color` on the
  parent.
- **Don't** add the version number, recolor the slash red, put the drive
  letter inside the mark, set `cd` in a sans-serif, or pair it with OpenCode's
  logo as if co-branded.

## Palette

| Token | Dark | Light | Role |
| --- | --- | --- | --- |
| `bg` | `#191724` | `#faf4ed` | Page / tile |
| `surface` | `#1f1d2e` | `#fffaf3` | Terminal, cards |
| `line` | `#2f2c45` | `#dfdad9` | Borders |
| `text` | `#e0def4` | `#26233a` | Body, `cd` |
| `dim` | `#6e6a86` | `#797593` | Secondary text |
| `mint` | `#7ee7c7` | `#1f7a68` | The slash, success, the correct path |
| `lav` | `#c4a7e7` | `#907aa9` | Prompt, special rows |
| `red` | `#eb6f92` | `#b4637a` | Old behavior, the drive letter |

Color never carries meaning alone: the wrong path is also struck through or
underlined and marked `✗`/`before`; the right one is marked `✓`/`after`.

## Type

JetBrains Mono (SIL OFL, `_build/fonts/OFL.txt`) for headlines, wordmark and
UI. System sans-serif only for long copy on the site. The mark itself is
outlines, not text.

## Rebuilding

Everything is generated from `_build/`:

```bash
# needs Node 18+ and playwright-core with Chromium
npx playwright install chromium
PLAYWRIGHT_CORE=$(npm root -g)/playwright-core ./assets/_build/build.sh
```

- `logo.mjs` — mark geometry and colors (single source of truth).
- `hero.html`, `banner.html`, `social.html` — layouts using `theme.css` tokens;
  open them in a browser with `?theme=light` to preview.
- `demo.html` — the GIF storyboard as code. Open it in a browser to watch the
  loop; `demo.mjs` encodes it with `gifenc` (MIT, vendored).
- `render.mjs` — HTML/SVG → PNG; `ico.mjs` — PNGs → `.ico`.

## Privacy

Every asset uses neutral sample directories (`projects/`, `api-gateway/`,
`dotfiles/`, `infra/`, `webapp/`). No hostnames, user paths beyond `/root`,
model names, keys or session content. Keep it that way when recording a real
capture: see `demo/STORYBOARD.md`.
