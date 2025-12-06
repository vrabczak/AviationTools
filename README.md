# Aviation Tools

Aviation Tools is a collection of quick-reference calculators for pilots, delivered as an offline-capable Progressive Web App built with React, TypeScript, and Vite. The tools focus on fast, cockpit-friendly workflows for performance, navigation, and approach planning.

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
npm run dev
```

The Vite dev server prints the local URL; open it in your browser to use the tools.

### Run tests

```bash
npm test
```

## Building for production

```bash
npm run build
```

The optimized assets are written to `dist/`. Use `npm run preview` to serve the build locally.

## Offline support

The app ships a service worker that precaches assets and serves navigation requests from cache for reliable offline use. Static assets use a stale-while-revalidate strategy, and images are cached with expiration to keep the footprint small.

## Deployment

The project is configured for GitHub Pages via `npm run deploy`, which builds the site and publishes the `dist/` directory.

## License

This project is available under the MIT License. See the license file in the repository for details.
