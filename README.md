# Aviation Tools

Aviation Tools is a collection of quick-reference calculators for pilots, delivered as an offline-capable Progressive Web App built with Angular and TypeScript. The tools focus on fast, cockpit-friendly workflows for performance, navigation, and approach planning.

## Disclaimer

These utilities are convenience aids only. Always cross-check calculator outputs with your own manual calculations and authoritative operational data before flying.

## Features

- **Temperature altitude correction** – adjust DA/MDA for non-ISA temperatures to maintain obstacle clearance.
- **Approach minima helper** – tabulated guidance for DA/MDA and height conversions.
- **Wind components** – headwind/tailwind and crosswind breakdowns from runway heading and reported winds.
- **Groundspeed and track** – computes track/groundspeed offsets using wind triangle inputs.
- **Standard rate turns** – turn radius and bank angle assistance for rate-one turns.
- **Coordinate utilities** – convert between latitude/longitude and MGRS.
- **Distance, fuel, and speed conversions** – convert among nautical, statute, metric units and common fuel/speed units.

## Getting started

### Prerequisites
- Node.js 18+
- npm 9+

### Install dependencies

```bash
npm install
```

### Run the app locally

```bash
npm start
```

The Angular dev server prints the local URL; open it in your browser to use the tools.

### Run tests

```bash
npm test
```

## Building for production

```bash
npm run build
```

The optimized assets are written to `dist/aviation-tools/`.

## Offline support

The app uses the Angular service worker to precache application assets for reliable offline use.

## Deployment

The project is configured for GitHub Pages via GitHub Actions, which builds the Angular production bundle and publishes `dist/aviation-tools/`.

## License

This project is licensed for non-commercial use.
Governmental institutions, public sector bodies,
non-profit organizations, and educational institutions
are explicitly permitted to use and modify the software.
