import { ITool } from './ITool';
import { jsx } from '../jsx-runtime';

/**
 * Minima Altitude/Height Tool
 * Calculates DA/MDA and DH/MDH based on OCA/OCH, aircraft minima, and operator margin
 */
export class MinimaAltitudeHeight implements ITool {
  id = 'minima';
  name = 'DA/MDA DH/MDH';
  description = 'Calculate DA/MDA and DH/MDH using OCA/OCH';

  private container: HTMLElement | null = null;

  render(container: HTMLElement): void {
    this.container = container;

    const content = (
      <div class="tool-content">
        <h2>Minima</h2>
        <p class="tool-description">
          Calculate Decision Altitude/Minimum Descent Altitude and Decision Height/Minimum Descent Height
          by combining published OCA/OCH, your aircraft minima, and any operator margin.
        </p>

        <div class="input-group">
          <label for="minima-oca">OCA (ft):</label>
          <input type="number" id="minima-oca" placeholder="e.g., 1500" step="1" />
          <small>Obstacle Clearance Altitude from the approach chart.</small>
        </div>

        <div class="input-group">
          <label for="minima-och">OCH (ft):</label>
          <input type="number" id="minima-och" placeholder="e.g., 200" step="1" />
          <small>Obstacle Clearance Height from the approach chart.</small>
        </div>

        <div class="input-group">
          <label for="minima-aircraft">Aircraft Minima (ft):</label>
          <input type="number" id="minima-aircraft" placeholder="e.g., 200" step="1" />
          <small>Aircraft-specific minima to compare against OCH.</small>
        </div>

        <div class="input-group">
          <label for="minima-operator">Operator Margin (ft):</label>
          <input type="number" id="minima-operator" placeholder="e.g., 100" step="1" value="0" />
          <small>Any additional margin required by your operator (enter 0 if none).</small>
        </div>

        <button id="calculate-minima" class="btn-primary">Calculate</button>

        <div id="minima-result" class="result hidden">
          <h3>Calculated Minima</h3>
          <div class="result-grid">
            <div class="result-value">
              <span class="label">DA / MDA</span>
              <span class="value" id="result-da">-</span>
              <span class="unit">ft</span>
            </div>
            <div class="result-value">
              <span class="label">DH / MDH</span>
              <span class="value" id="result-dh">-</span>
              <span class="unit">ft</span>
            </div>
          </div>
          <div class="result-info">
            <p id="minima-note"></p>
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
    const calculateBtn = this.container?.querySelector('#calculate-minima');
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
    const oca = parseFloat((this.container?.querySelector('#minima-oca') as HTMLInputElement)?.value);
    const och = parseFloat((this.container?.querySelector('#minima-och') as HTMLInputElement)?.value);
    const aircraftMinima = parseFloat(
      (this.container?.querySelector('#minima-aircraft') as HTMLInputElement)?.value
    );
    const operatorMargin = parseFloat(
      (this.container?.querySelector('#minima-operator') as HTMLInputElement)?.value
    );

    if ([oca, och, aircraftMinima, operatorMargin].some(value => isNaN(value))) {
      alert('Please fill in all fields with valid numbers.');
      return;
    }

    if ([oca, och, aircraftMinima, operatorMargin].some(value => value < 0)) {
      alert('Values cannot be negative.');
      return;
    }

    const usesAircraftMinima = och < aircraftMinima;
    const aircraftAdjustment = usesAircraftMinima ? aircraftMinima - och : 0;

    const decisionAltitude = oca + aircraftAdjustment + operatorMargin;
    const decisionHeight = (usesAircraftMinima ? aircraftMinima : och) + operatorMargin;

    this.displayResult(decisionAltitude, decisionHeight, usesAircraftMinima, aircraftAdjustment);
  }

  private displayResult(
    decisionAltitude: number,
    decisionHeight: number,
    aircraftOverride: boolean,
    aircraftAdjustment: number
  ): void {
    const resultDiv = this.container?.querySelector('#minima-result');
    const daField = this.container?.querySelector('#result-da');
    const dhField = this.container?.querySelector('#result-dh');
    const noteField = this.container?.querySelector('#minima-note');

    if (resultDiv && daField && dhField && noteField) {
      resultDiv.classList.remove('hidden');
      daField.textContent = Math.round(decisionAltitude).toLocaleString('en-US');
      dhField.textContent = Math.round(decisionHeight).toLocaleString('en-US');

      noteField.textContent = aircraftOverride
        ? `OCH is below the aircraft minima by ${Math.round(aircraftAdjustment)} ft. Added the difference to DA/MDA and set DH/MDH to the aircraft minima before applying the operator margin.`
        : 'Used published OCA/OCH and applied the operator margin.';
      noteField.textContent = noteField.textContent + ' Always crosscheck with manual calculations!';
      try {
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (_) {
        (resultDiv as HTMLElement).scrollIntoView();
      }
    }
  }
}
