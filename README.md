[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/sanschiko3-dotcom/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/sanschiko3-dotcom/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

# Vice Cover Studio

An original sunset crime-poster collage editor, drawn with Canvas 2D.
No Rockstar artwork, logos, or fonts are included.

Run `node serve.ts --port 8080` and open http://localhost:8080.
The app needs no build step and uses only local assets.

Add photos or drop them onto the editor. Select a panel and click a thumbnail
to assign its photo. Drag to pan; scroll or use the slider to zoom.
Fit / Fill changes the crop mode. Three layouts and three color stories
combine with editable titles, subtitles, and title placement.

Export PNG produces 1080×1080, 1080×1350, or 1920×1080 artwork.
Photos remain in your browser and are never uploaded.

Deterministic scenes use `?shot=cover&photo=pier&caption=Sunset%20Heist`
or `?shot=editor&photo=boulevard&caption=Boulevard%20Queen`.
Optional `layout` and `size` parameters select composition and dimensions.

Run `MAKEFUN_OUTPUT_DIR=/tmp/gta6-out node main.ts` to package the dossier.
The two included sample photographs are supplied by the competition kit.
All silhouettes, texture, lettering treatments, and layouts are original code.
