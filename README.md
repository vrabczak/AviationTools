# Aviation Tools

Aviation Tools is an offline-capable Progressive Web App built with Angular and TypeScript for quick cockpit and pre-flight calculations. It bundles focused utilities for navigation, approach planning, helicopter performance checks, and unit conversions in a single mobile-friendly app.

## Disclaimer

These tools are convenience aids only. Always verify outputs against approved flight documents, aircraft manuals, and operational data before use in flight.

## Tool Suite

### Navigation tools

- **Altitude Correction** - calculate temperature-corrected altitude for cold-weather approach procedures.
- **Approach Table** - generate an approach table with distances, altitudes, and heights above a target altitude.
- **DA/MDA DH/MDH** - convert between OCA/OCH and resulting decision or minimum descent values.
- **Head/Cross Wind** - compute headwind, tailwind, and crosswind components for a runway or heading.
- **Holding Entry** - determine direct, parallel, or teardrop entry for a published hold.
- **Track / Ground Speed** - solve wind triangle outputs from heading, TAS, and wind.
- **Turn Calculator** - calculate turn radius and turn rate from speed and bank angle.
- **Fly-By Turn** - compute turn anticipation distance and turn radius from track change.
- **Speed / Distance / Time** - solve the missing value from speed, distance, and time.
- **Fuel Consumption / Quantity / Endurance** - solve the missing value from fuel flow, fuel quantity, and endurance.

### Conversion tools

- **Coordinates Conversion** - convert between DD, DM, DMS, and 5-digit MGRS coordinates.
- **Distance Conversion** - convert between meters, kilometers, nautical miles, feet, and statute miles.
- **Fuel Conversion** - convert between liters, kilograms, gallons, and pounds using fuel density.
- **Speed Conversion** - convert between knots, km/h, m/s, and ft/min.

### Performance tools

- **IGE Margin** - calculate in-ground-effect hover margin from gross weight, temperature, and altitude.
- **OGE Margin** - calculate out-of-ground-effect hover margin from gross weight, temperature, and altitude.

## App Features

- Offline support through the Angular service worker after the first successful load.
- Mobile-friendly layout with a categorized tool menu.
- Light and dark theme support with local preference persistence.
- Static deployment to GitHub Pages.

## Getting Started

### Prerequisites

- Node.js
- npm

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm start
```

The Angular dev server prints the local URL for the app.

### Run tests

```bash
npm test
```

## Production Build

```bash
npm run build
```

The production bundle is written to `dist/aviation-tools/`.

## Deployment

GitHub Actions builds the production bundle and publishes the app to GitHub Pages using the repository `homepage` and production base href configuration.
