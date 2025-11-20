# ✈️ Aviation Tools

A single-page Progressive Web App (PWA) providing essential aviation calculators for pilots. Built with TypeScript and Webpack, fully offline-capable.

## Features

- ✅ **Offline Support**: Works completely offline via service worker caching
- ✅ **Single Bundle**: Everything packed into one HTML file and bundle.js
- ✅ **TypeScript**: Type-safe code with full TypeScript support
- ✅ **Responsive Design**: Works on desktop, tablet, and mobile
- ✅ **PWA**: Installable on devices for app-like experience
- ✅ **VS Code Debugging**: F5 to launch Chrome with source maps

## Available Tools

### 1. Altitude Correction (Density Altitude)
Calculate density altitude based on:
- Indicated altitude (ft)
- Airport elevation (ft)  
- Temperature (°C)

Helps assess aircraft performance in different atmospheric conditions.

### 2. Turn Calculator
Calculate turn performance based on:
- True airspeed (kt)
- Bank angle (°)

Outputs:
- Turn radius (meters)
- Time for 360° turn
- Turn rate (°/sec)

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Setup

```bash
# Install dependencies
npm install
```

## Development

### Run Development Server

```bash
npm run dev
```

This will:
- Start webpack-dev-server on http://localhost:8080
- Enable hot module replacement
- Open browser automatically

### Debug in VS Code

1. Press **F5** in VS Code
2. Chrome will launch with debugger attached
3. Set breakpoints in `.ts` files
4. Debug TypeScript source code directly

## Build for Production

```bash
npm run build
```

Outputs to `dist/` folder:
- `index.html` - Main HTML file
- `bundle.js` - JavaScript bundle with inlined CSS and images
- `bundle.js.map` - Source map for debugging

## Deployment

### Local Disk (Offline)

1. Build the project: `npm run build`
2. Open `dist/index.html` in any browser
3. Works completely offline!

### GitHub Pages

1. Build the project: `npm run build`
2. Push `dist/` folder to `gh-pages` branch:

```bash
# One-time setup
git subtree push --prefix dist origin gh-pages

# Or use gh-pages package
npx gh-pages -d dist
```

3. Enable GitHub Pages in repository settings
4. Access at: `https://yourusername.github.io/repository-name/`

### Other Hosting

Simply upload the contents of `dist/` to any static hosting:
- Netlify
- Vercel
- AWS S3
- Azure Static Web Apps
- Any web server

## Project Structure

```
aviation-tools/
├── src/
│   ├── index.ts              # Entry point
│   ├── index.html            # HTML template
│   ├── App.ts                # Main app controller
│   ├── components/
│   │   ├── Menu.ts            # Menu component
│   │   └── ToolContainer.ts   # Tool display container
│   ├── tools/
│   │   ├── ITool.ts           # Tool interface
│   │   ├── ToolRegistry.ts    # Tool registry
│   │   ├── AltitudeCorrection.ts
│   │   └── TurnCalculator.ts
│   └── styles/
│       ├── main.css           # Global styles
│       ├── menu.css           # Menu styles
│       └── tools.css          # Tool styles
├── public/
│   └── manifest.json         # PWA manifest
├── dist/                     # Build output
├── webpack.config.js         # Webpack configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies
```

## Adding New Tools

1. Create new tool class in `src/tools/`:

```typescript
import { ITool } from './ITool';

export class MyNewTool implements ITool {
  id = 'my-new-tool';
  name = 'My New Tool';
  description = 'Description of the tool';

  render(container: HTMLElement): void {
    // Render your tool UI
  }

  destroy(): void {
    // Cleanup
  }
}
```

2. Register in `src/tools/ToolRegistry.ts`:

```typescript
import { MyNewTool } from './MyNewTool';

private static tools: ITool[] = [
  new AltitudeCorrection(),
  new TurnCalculator(),
  new MyNewTool(), // Add here
];
```

3. Done! Tool will appear in menu automatically.

## Technologies Used

- **TypeScript** - Type-safe JavaScript
- **Webpack 5** - Module bundler
- **CSS3** - Styling with CSS variables
- **HTML5** - Semantic markup
- **Service Worker** - Offline support (production)

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT License - feel free to use for any purpose.

## Aviation Formulas

### Density Altitude
```
DA = PA + [120 × (OAT - ISA)]
```
Where:
- DA = Density Altitude
- PA = Pressure Altitude
- OAT = Outside Air Temperature
- ISA = Standard Temperature at altitude

### Turn Radius
```
R = V² / (g × tan(θ))
```
Where:
- R = Turn radius (m)
- V = True airspeed (m/s)
- g = 9.81 m/s²
- θ = Bank angle (radians)

### Turn Rate
```
Rate = (g × tan(θ)) / V × (180/π)
```

## Contributing

Contributions welcome! Please feel free to submit issues or pull requests.

## Disclaimer

⚠️ **For educational and planning purposes only. Always use official aviation resources and charts for flight planning and operations.**