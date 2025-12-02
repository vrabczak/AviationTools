import { ITool } from './ITool';
import { jsx } from '../jsx-runtime';

/**
 * Head/Cross Wind Tool
 * Calculates headwind and crosswind components relative to aircraft heading
 */
export class HeadCrossWind implements ITool {
  id = 'head-cross-wind';
  name = 'Head/Cross Wind';
  description = 'Compute headwind and crosswind components for a given runway or heading';

  private container: HTMLElement | null = null;

  render(container: HTMLElement): void {
    this.container = container;

    const content = (
      <div class="tool-content">
        <h2>Head/Cross Wind</h2>
        <p class="tool-description">
          Calculate how much of the reported wind becomes headwind/tailwind and crosswind
          for your selected runway or course. Enter directions in degrees true or magnetic
          consistently with your aircraft heading.
        </p>

        <div class="input-group">
          <label for="wind-speed">Wind Speed (kt):</label>
          <input type="number" id="wind-speed" placeholder="e.g., 18" min="0" step="0.1" />
        </div>

        <div class="input-group">
          <label for="wind-direction">Wind Direction (° from):</label>
          <input type="number" id="wind-direction" placeholder="e.g., 210" min="0" max="360" step="1" />
          <small>Direction the wind is coming from. Use the same reference as your heading (true or magnetic).</small>
        </div>

        <div class="input-group">
          <label for="aircraft-heading">Aircraft Heading / Runway (°):</label>
          <input type="number" id="aircraft-heading" placeholder="e.g., 180" min="0" max="360" step="1" />
        </div>

        <button id="calculate-wind" class="btn-primary">Calculate</button>

        <div id="wind-result" class="result hidden">
          <h3>Wind Components</h3>
          <div class="result-grid">
            <div class="result-value">
              <span class="label">Headwind / Tailwind</span>
              <span id="headwind-value" class="value">-</span>
              <span class="unit">kt</span>
            </div>
            <div class="result-value">
              <span class="label">Crosswind</span>
              <span id="crosswind-value" class="value">-</span>
              <span class="unit">kt</span>
            </div>
          </div>
          <div id="wind-interpretation" class="result-info">
            <p></p>
          </div>
        </div>
      </div>
    );

    container.appendChild(content as Node);
    this.attachEventListeners();
  }

  destroy(): void {
    this.container = null;
  }

  private attachEventListeners(): void {
    const calculateBtn = this.container?.querySelector('#calculate-wind');
    calculateBtn?.addEventListener('click', () => this.calculate());

    const inputs = this.container?.querySelectorAll('input');
    inputs?.forEach(input => {
      input.addEventListener('keypress', (e: Event) => {
        if ((e as KeyboardEvent).key === 'Enter') {
          this.calculate();
        }
      });
    });
  }

  private calculate(): void {
    const windSpeed = parseFloat(
      (this.container?.querySelector('#wind-speed') as HTMLInputElement)?.value
    );
    const windDirection = parseFloat(
      (this.container?.querySelector('#wind-direction') as HTMLInputElement)?.value
    );
    const aircraftHeading = parseFloat(
      (this.container?.querySelector('#aircraft-heading') as HTMLInputElement)?.value
    );

    if (isNaN(windSpeed) || isNaN(windDirection) || isNaN(aircraftHeading)) {
      alert('Please fill in all fields with valid numbers');
      return;
    }

    if (windSpeed < 0) {
      alert('Wind speed must be zero or greater');
      return;
    }

    const normalizedWindDir = this.normalizeDegrees(windDirection);
    const normalizedHeading = this.normalizeDegrees(aircraftHeading);

    const { headwind, crosswind, crosswindFrom } = this.calculateComponents(
      windSpeed,
      normalizedWindDir,
      normalizedHeading
    );

    this.displayResults(headwind, crosswind, crosswindFrom);
  }

  private displayResults(headwind: number, crosswind: number, crosswindFrom: 'left' | 'right' | 'none'): void {
    const resultDiv = this.container?.querySelector('#wind-result');
    const headwindSpan = this.container?.querySelector('#headwind-value');
    const crosswindSpan = this.container?.querySelector('#crosswind-value');
    const interpretationContainer = this.container?.querySelector('#wind-interpretation p');

    if (!resultDiv || !headwindSpan || !crosswindSpan || !interpretationContainer) {
      return;
    }

    const headwindAbs = Math.round(Math.abs(headwind) * 10) / 10;
    const crosswindAbs = Math.round(Math.abs(crosswind) * 10) / 10;

    const headwindLabel = headwind >= 0 ? 'headwind' : 'tailwind';
    const crosswindLabel = crosswindFrom === 'none' ? 'no crosswind' : `from the ${crosswindFrom}`;

    headwindSpan.textContent = `${headwindAbs.toFixed(1)} (${headwindLabel})`;
    crosswindSpan.textContent = `${crosswindAbs.toFixed(1)} (${crosswindLabel})`;

    interpretationContainer.textContent = '';

    resultDiv.classList.remove('hidden');
    try {
      resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (_) {
      (resultDiv as HTMLElement).scrollIntoView();
    }
  }

  private calculateComponents(
    windSpeed: number,
    windDirection: number,
    aircraftHeading: number
  ): { headwind: number; crosswind: number; crosswindFrom: 'left' | 'right' | 'none' } {
    const relativeDirectionRad = ((windDirection - aircraftHeading) * Math.PI) / 180;
    const headwind = windSpeed * Math.cos(relativeDirectionRad);
    const crosswind = windSpeed * Math.sin(relativeDirectionRad);

    let crosswindFrom: 'left' | 'right' | 'none' = 'none';
    if (Math.abs(crosswind) >= 0.05) {
      crosswindFrom = crosswind > 0 ? 'right' : 'left';
    }

    return { headwind, crosswind, crosswindFrom };
  }

  private normalizeDegrees(value: number): number {
    const normalized = value % 360;
    return normalized < 0 ? normalized + 360 : normalized;
  }
}
