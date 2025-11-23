import { ITool } from './ITool';
import { jsx } from '../jsx-runtime';

/**
 * Track / Ground Speed Tool
 * Computes resultant ground track and groundspeed based on heading, TAS, and wind
 */
export class TrackGroundSpeed implements ITool {
  id = 'track-ground-speed';
  name = 'Track / Ground Speed';
  description = 'Calculate aircraft track and groundspeed from heading, TAS, and wind';

  private container: HTMLElement | null = null;

  render(container: HTMLElement): void {
    this.container = container;

    const content = (
      <div class="tool-content">
        <h2>Track / Ground Speed</h2>
        <p class="tool-description">
          Determine your expected track and groundspeed by combining true/magnetic heading,
          true airspeed, and reported wind. Use consistent references for directions (all true
          or all magnetic).
        </p>

        <div class="input-group">
          <label for="wind-direction">Wind Direction (° from):</label>
          <input type="number" id="wind-direction" placeholder="e.g., 240" min="0" max="360" step="1" />
          <small>Direction the wind is coming from.</small>
        </div>

        <div class="input-group">
          <label for="wind-speed">Wind Speed (kt):</label>
          <input type="number" id="wind-speed" placeholder="e.g., 18" min="0" step="0.1" />
        </div>

        <div class="input-group">
          <label for="aircraft-heading">Aircraft Heading (°):</label>
          <input type="number" id="aircraft-heading" placeholder="e.g., 210" min="0" max="360" step="1" />
        </div>

        <div class="input-group">
          <label for="aircraft-tas">Aircraft TAS (kt):</label>
          <input type="number" id="aircraft-tas" placeholder="e.g., 125" min="0" step="0.1" />
        </div>

        <button id="calculate-ground" class="btn-primary">Calculate</button>

        <div id="ground-result" class="result hidden">
          <h3>Results</h3>
          <div class="result-grid">
            <div class="result-value">
              <span class="label">Ground Track</span>
              <span id="ground-track" class="value">-</span>
              <span class="unit">°</span>
            </div>
            <div class="result-value">
              <span class="label">Groundspeed</span>
              <span id="ground-speed" class="value">-</span>
              <span class="unit">kt</span>
            </div>
          </div>
          <div id="ground-interpretation" class="result-info">
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
    const calculateBtn = this.container?.querySelector('#calculate-ground');
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
    const windDirection = parseFloat(
      (this.container?.querySelector('#wind-direction') as HTMLInputElement)?.value
    );
    const windSpeed = parseFloat((this.container?.querySelector('#wind-speed') as HTMLInputElement)?.value);
    const heading = parseFloat((this.container?.querySelector('#aircraft-heading') as HTMLInputElement)?.value);
    const tas = parseFloat((this.container?.querySelector('#aircraft-tas') as HTMLInputElement)?.value);

    if (isNaN(windDirection) || isNaN(windSpeed) || isNaN(heading) || isNaN(tas)) {
      alert('Please fill in all fields with valid numbers');
      return;
    }

    if (windSpeed < 0 || tas < 0) {
      alert('Speeds must be zero or greater');
      return;
    }

    const normalizedWindDir = this.normalizeDegrees(windDirection);
    const normalizedHeading = this.normalizeDegrees(heading);

    const { groundTrack, groundSpeed } = this.calculateGroundVector(
      normalizedHeading,
      tas,
      normalizedWindDir,
      windSpeed
    );

    this.displayResults(groundTrack, groundSpeed, tas);
  }

  private displayResults(groundTrack: number, groundSpeed: number, tas: number): void {
    const resultDiv = this.container?.querySelector('#ground-result');
    const trackSpan = this.container?.querySelector('#ground-track');
    const speedSpan = this.container?.querySelector('#ground-speed');
    const interpretationContainer = this.container?.querySelector('#ground-interpretation p');

    if (!resultDiv || !trackSpan || !speedSpan || !interpretationContainer) {
      return;
    }

    resultDiv.classList.remove('hidden');
    trackSpan.textContent = `${groundTrack.toFixed(0).padStart(3, '0')}°`;
    speedSpan.textContent = groundSpeed.toFixed(1);

    const speedChange = groundSpeed - tas;
    const changeLabel = speedChange > 0 ? 'tailwind component increasing' : speedChange < 0 ? 'headwind component reducing' : 'little change to';
    interpretationContainer.textContent = `Groundspeed is ${Math.abs(speedChange).toFixed(1)} kt ${speedChange === 0 ? 'different from' : speedChange > 0 ? 'faster than' : 'slower than'} TAS with a ${changeLabel} your airspeed.`;
  }

  private calculateGroundVector(
    heading: number,
    tas: number,
    windFromDirection: number,
    windSpeed: number
  ): { groundTrack: number; groundSpeed: number } {
    const headingRad = (heading * Math.PI) / 180;
    const windToDirection = this.normalizeDegrees(windFromDirection + 180);
    const windToRad = (windToDirection * Math.PI) / 180;

    // Aircraft velocity vector (north is positive Y, east is positive X)
    const aircraftVx = tas * Math.sin(headingRad);
    const aircraftVy = tas * Math.cos(headingRad);

    // Wind velocity vector (blowing towards windToDirection)
    const windVx = windSpeed * Math.sin(windToRad);
    const windVy = windSpeed * Math.cos(windToRad);

    const totalVx = aircraftVx + windVx;
    const totalVy = aircraftVy + windVy;

    const groundSpeed = Math.sqrt(totalVx * totalVx + totalVy * totalVy);
    const groundTrack = this.normalizeDegrees((Math.atan2(totalVx, totalVy) * 180) / Math.PI);

    return { groundTrack, groundSpeed };
  }

  private normalizeDegrees(value: number): number {
    const normalized = value % 360;
    return normalized < 0 ? normalized + 360 : normalized;
  }
}
