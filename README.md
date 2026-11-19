[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/sanschiko3-dotcom/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/sanschiko3-dotcom/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

# Vice Cover Studio v2

Vice Cover Studio is an offline, canvas-first poster lab for making original neon Vice City cover art from local photos. It keeps the photo roll in the browser, gives every panel its own crop, and exports square, portrait, and wide PNGs.

## Included

- Eight collage compositions: Hero, Columns, Strip, Slash, Grid, Duo, Triptych, and Tilted.
- Six skin-safe color stories, title-over-art lettering, badge ribbon, quote, tags, palm band, and a five-star heat meter.
- Local sample photos, multi-file uploads, panel assignment, drag-to-pan, wheel zoom, Fill/Fit, Reset, keyboard nudging, Surprise Me, and 20-step undo/redo.
- Deterministic `?shot=cover` and `?shot=editor` scenes for review.

## Run locally

```sh
node serve.ts --port 8080
```

Open `http://127.0.0.1:8080/`. No build step, remote request, external font, or upload service is used. The app's art is original canvas work and contains no game logos or official artwork.
