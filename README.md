[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/sanschiko3-dotcom/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/sanschiko3-dotcom/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

# Vice Cover Studio

An offline poster workshop for original neon crime-fiction covers.
Bring local photos, arrange three panels, and write your headline.
No accounts, build step, remote fonts, or photo uploads.

## Run

Use Node.js 22.18 or newer: `node serve.ts --port 8080`.
Open http://127.0.0.1:8080 in desktop Chrome.

## Make a poster

1. Add images or drop them into the window.
2. Click a panel, then a thumbnail to assign its image.
3. Drag to pan; scroll or use Zoom. Fit / Fill changes framing.
4. Choose a layout and Sunset, Neon, or Noir grading.
5. Edit title, subtitle, and top or bottom placement.
6. Choose square, portrait, or widescreen and export PNG.

Exports are 1080 × 1080, 1080 × 1350, or 1920 × 1080.
The renderer draws original palms, skyline, halftone, and lettering.
The two sample photos are the kit's freely usable images.
No Rockstar artwork, logos, characters, or fonts are included.

## Scenes

Use `?shot=cover&photo=pier&caption=Sunset%20Heist&layout=hero&size=1080x1080`.
Use `?shot=editor&photo=boulevard&caption=Boulevard%20Queen` for the editor.
Layouts: hero, columns, strip. Readiness: `window.__shotReady`.

## Package

Run `MAKEFUN_OUTPUT_DIR=/tmp/gta6-out node main.ts` to build the dossier.
The implementation uses the root MIT license.
