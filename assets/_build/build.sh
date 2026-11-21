#!/usr/bin/env bash
# Rebuilds every brand asset from source. Needs Node 18+ and playwright-core
# with Chromium installed (`npx playwright install chromium`). Point
# PLAYWRIGHT_CORE at a playwright-core directory if it is not resolvable.
set -euo pipefail
cd "$(dirname "$0")"
B=../brand R=../readme S=../social
node logo.mjs
for t in dark light; do
  for s in 512 1024; do node render.mjs $B/logo-$t.svg $B/logo-$t-$s.png $s $s; done
done
for s in 512 1024; do node render.mjs $B/logo-mono.svg $B/logo-mono-$s.png $s $s; done
for s in 16 32 48; do node render.mjs $B/favicon-dark.svg $B/favicon-$s.png $s $s; done
node render.mjs $B/logo-dark.svg $B/apple-touch-icon.png 180 180
node ico.mjs $B/favicon.ico $B/favicon-16.png $B/favicon-32.png $B/favicon-48.png
for t in dark light; do node render.mjs hero.html $R/hero-$t.png 800 440 2 $t; done
node render.mjs banner.html $S/npm-banner.png 1200 400 1 dark
node render.mjs social.html $S/social-preview.png 1280 640 1 dark
node demo.mjs
echo "assets rebuilt"
