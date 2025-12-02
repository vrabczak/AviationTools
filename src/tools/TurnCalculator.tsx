import { ITool } from './ITool';
import { jsx } from '../jsx-runtime';

/**
 * Turn Calculator Tool
 * Calculates turn radius and time for 360° turn based on speed and bank angle
 */
export class TurnCalculator implements ITool {
  id = 'turn-calculator';
  name = 'Turn Calculator';
  description = 'Calculate turn radius and rate based on speed and bank angle';

  private container: HTMLElement | null = null;

  render(container: HTMLElement): void {
    this.container = container;
    
    const content = (
      <div class="tool-content">
        <h2>Turn Calculator</h2>
        <p class="tool-description">
          Calculate turn performance including turn radius and time to complete a 360° turn.
          Useful for planning holds, procedure turns, and traffic patterns.
        </p>
        
        <div class="input-group">
          <label for="speed">True Airspeed (kt):</label>
          <input type="number" id="speed" placeholder="e.g., 120" step="1" min="1" />
        </div>
        
        <div class="input-group">
          <label for="bank-angle">Bank Angle (°):</label>
          <input type="number" id="bank-angle" placeholder="e.g., 15" step="1" min="1" max="89" />
          <small>Typical: 15° (standard rate), 30° (steep), 45° (very steep)</small>
        </div>
        
        <button id="calculate-turn" class="btn-primary">Calculate</button>
        
        <div id="turn-result" class="result hidden">
          <h3>Results:</h3>
          <div class="result-grid">
            <div class="result-value">
              <span class="label">Turn Radius:</span>
              <span id="turn-radius" class="value">-</span>
              <span class="unit">m</span>
            </div>
            <div class="result-value">
              <span class="label">360° Turn Time:</span>
              <span id="turn-time" class="value">-</span>
            </div>
            <div class="result-value">
              <span class="label">Turn Rate:</span>
              <span id="turn-rate" class="value">-</span>
              <span class="unit">°/sec</span>
            </div>
          </div>
          <div class="result-info">
            <p id="turn-interpretation"></p>
          </div>
        </div>
      </div>
    );

    container.appendChild(content as Node);
    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const calculateBtn = this.container?.querySelector('#calculate-turn');
    calculateBtn?.addEventListener('click', () => this.calculate());

    // Allow Enter key to trigger calculation
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
    const speed = parseFloat(
      (this.container?.querySelector('#speed') as HTMLInputElement)?.value
    );
    const bankAngle = parseFloat(
      (this.container?.querySelector('#bank-angle') as HTMLInputElement)?.value
    );

    if (isNaN(speed) || isNaN(bankAngle)) {
      alert('Please fill in all fields with valid numbers');
      return;
    }

    if (speed <= 0) {
      alert('Speed must be greater than 0');
      return;
    }

    if (bankAngle <= 0 || bankAngle >= 90) {
      alert('Bank angle must be between 0 and 90 degrees');
      return;
    }

    // Calculate turn performance
    const { radiusMeters, time360Seconds } = this.calculateTurn(speed, bankAngle);
    const turnRateDegPerSec = 360 / time360Seconds;

    // Display results
    const resultDiv = this.container?.querySelector('#turn-result');
    const radiusSpan = this.container?.querySelector('#turn-radius');
    const timeSpan = this.container?.querySelector('#turn-time');
    const rateSpan = this.container?.querySelector('#turn-rate');
    const interpretationP = this.container?.querySelector('#turn-interpretation');

    if (resultDiv && radiusSpan && timeSpan && rateSpan && interpretationP) {
      resultDiv.classList.remove('hidden');
      radiusSpan.textContent = radiusMeters.toLocaleString();
      
      // Format time as minutes and seconds
      const minutes = Math.floor(time360Seconds / 60);
      const seconds = Math.round(time360Seconds % 60);
      timeSpan.textContent = `${minutes}m ${seconds}s`;
      
      rateSpan.textContent = turnRateDegPerSec.toFixed(2);

      // Interpretation
      if (turnRateDegPerSec >= 2.9 && turnRateDegPerSec <= 3.1) {
        interpretationP.textContent = 'This is approximately a standard rate turn (3°/sec).';
        interpretationP.className = 'result-info success';
      } else if (turnRateDegPerSec > 3.1) {
        interpretationP.textContent = 'This is faster than a standard rate turn.';
        interpretationP.className = 'result-info';
      } else {
        interpretationP.textContent = 'This is slower than a standard rate turn.';
        interpretationP.className = 'result-info';
      }
      try {
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (_) {
        (resultDiv as HTMLElement).scrollIntoView();
      }
    }
  }

  private calculateTurn(
    speedKnots: number,
    bankAngle: number
  ): { radiusMeters: number; time360Seconds: number } {
    if (bankAngle === 0 || bankAngle >= 90) {
      return { radiusMeters: Infinity, time360Seconds: Infinity };
    }
    
    const speedMps = speedKnots * 0.514444;
    const bankRad = (bankAngle * Math.PI) / 180;
    const radius = (speedMps * speedMps) / (9.81 * Math.tan(bankRad));
    const turnRateDegPerSec = ((9.81 * Math.tan(bankRad)) / speedMps) * (180 / Math.PI);
    const time360 = 360 / turnRateDegPerSec;
    
    return {
      radiusMeters: Math.round(radius),
      time360Seconds: Math.round(time360),
    };
  }

  destroy(): void {
    this.container = null;
  }
}
