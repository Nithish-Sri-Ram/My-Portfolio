# My Portfolio

Live at [nithish-sri-ram.github.io/My-Portfolio](https://nithish-sri-ram.github.io/My-Portfolio/).

Built with Vite and plain JavaScript modules. Fonts (Geist, Geist Mono) are self-hosted.

## Run locally

```sh
npm install
npm run dev       # http://localhost:5173
npm run build     # static site in dist/
npm run preview
```

## Deploy

Every push to `main` builds the site and publishes it to GitHub Pages (`.github/workflows/deploy.yml`).

With Docker:

```sh
docker build -t portfolio .
docker run -p 8080:80 portfolio
```

## Where things live

- `index.html`: all content
- `src/style.css`: the visual system (light and dark, five accent colours)
- `src/motion.js`: reveals and the progress bar, all gated by `.motion-on` (off for reduced motion, Pause motion, or `?noanim`)
- `src/ui.js`: Appearance, Sections drawer, folding sections, Say hello card, clock, demo video
- `src/sound.js`: ambient sound and ticks, generated with Web Audio
- `src/studio.js`: the SimFabric studio illustration
- `src/github.js`: the "Find me on GitHub" squares
- `src/devices.js`: auto-scrolling phone and laptop screens
- `src/ascii/`: the text-art renderer and its art
- `tools/ascii.py`: turns an image into text art for `src/ascii/art.js`

```sh
python3 tools/ascii.py path/to/image.png 96
```
