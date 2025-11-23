import { ITool } from './ITool';
import { jsx } from '../jsx-runtime';

/**
 * Altitude Correction Tool
 * Calculates temperature-corrected altitude for approach procedures
 */
export class AltitudeCorrection implements ITool {
  id = 'altitude-correction';
  name = 'Altitude Correction';
  description = 'Calculate temperature-corrected altitude for approach procedures';

  private container: HTMLElement | null = null;

  render(container: HTMLElement): void {
    this.container = container;
    
    const content = (
      <div class="tool-content">
        <h2>Altitude Correction (Temperature)</h2>
        <p class="tool-description">
          Calculate temperature-corrected altitude for approach procedures. Cold temperatures cause
          the aircraft to be lower than indicated, warm temperatures cause it to be higher.
          Critical for Decision Altitude and Minimum Descent Altitude.
        </p>
        
        <div class="input-group">
          <label for="decision-alt">DA / MDA (ft):</label>
          <input type="number" id="decision-alt" placeholder="e.g., 1700" step="10" />
          <small>Altitude you want to correct (e.g., Decision Altitude, Minimum Descent Altitude)</small>
        </div>
        
        <div class="input-group">
          <label for="airport-alt">Airport Elevation (ft):</label>
          <input type="number" id="airport-alt" placeholder="e.g., 1500" step="10" />
        </div>
        
        <div class="input-group">
          <label for="temperature">Airport Temperature (°C):</label>
          <input type="number" id="temperature" placeholder="e.g., -15" step="0.1" />
        </div>
        
        <button id="calculate-alt" class="btn-primary">Calculate</button>
        
        <div id="altitude-result" class="result hidden">
          <h3>Result:</h3>
          <div class="result-value">
            <span class="label">Corrected Altitude:</span>
            <span id="corrected-alt" class="value">-</span>
            <span class="unit">ft</span>
          </div>
          <div class="result-value">
            <span class="label">Correction:</span>
            <span id="correction-value" class="value">-</span>
            <span class="unit">ft</span>
          </div>
          <div class="result-info">
            <p id="result-interpretation"></p>
          </div>
        </div>
      </div>
    );

    container.appendChild(content as Node);
    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const calculateBtn = this.container?.querySelector('#calculate-alt');
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
    const decisionAlt = parseFloat(
      (this.container?.querySelector('#decision-alt') as HTMLInputElement)?.value
    );
    const airportAlt = parseFloat(
      (this.container?.querySelector('#airport-alt') as HTMLInputElement)?.value
    );
    const temperature = parseFloat(
      (this.container?.querySelector('#temperature') as HTMLInputElement)?.value
    );

    if (isNaN(decisionAlt) || isNaN(airportAlt) || isNaN(temperature)) {
      alert('Please fill in all fields with valid numbers');
      return;
    }

    // Calculate temperature-corrected altitude
    const { correctedAltitude, correction } = this.calculateTemperatureCorrection(
      decisionAlt,
      airportAlt,
      temperature
    );

    // Display result
    const resultDiv = this.container?.querySelector('#altitude-result');
    const correctedAltSpan = this.container?.querySelector('#corrected-alt');
    const correctionSpan = this.container?.querySelector('#correction-value');
    const interpretationP = this.container?.querySelector('#result-interpretation');

    if (resultDiv && correctedAltSpan && correctionSpan && interpretationP) {
      resultDiv.classList.remove('hidden');
      correctedAltSpan.textContent = Math.round(correctedAltitude).toLocaleString();
      
      const correctionSign = correction >= 0 ? '+' : '';
      correctionSpan.textContent = `${correctionSign}${Math.round(correction).toLocaleString()}`;

      // Interpretation based on temperature
      if (correction < 0) {
        interpretationP.textContent = `Cold temperature! You will be LOWER than indicated altitude. Add ${Math.abs(Math.round(correction))} ft to your decision altitude to maintain safe terrain clearance.`;
        interpretationP.className = 'result-info warning';
      } else {
        interpretationP.textContent = `Warm temperature. You will be HIGHER than indicated altitude by ${Math.round(correction)} ft. Correction usually not applied for warmer temperatures.`;
        interpretationP.className = 'result-info';
      } 
    }
  }

  private calculateTemperatureCorrection(
    decisionAltitude: number,
    airportAltitude: number,
    temperature: number
  ): { correctedAltitude: number; correction: number } {
    // Height above airport
    const heightAboveAirport = decisionAltitude - airportAltitude;
    
    // ISA temperature at airport elevation (15°C at sea level, -2°C per 1000ft)
    const isaTemp = 15 - (airportAltitude / 1000) * 2;
    
    // Temperature deviation from ISA
    const tempDeviation = temperature - isaTemp;
    
    // Temperature correction formula: 
    // Correction = Height × (Actual Temp - ISA Temp) / (ISA Temp in Kelvin)
    // Using simplified ICAO formula: 4% correction per 10°C deviation
    const isaKelvin = isaTemp + 273.15;
    const correction = (heightAboveAirport * tempDeviation) / isaKelvin;
    
    // Corrected altitude (add correction when cold, subtract when warm)
    // But typically we add to the minimum to ensure terrain clearance
    const correctedAltitude = decisionAltitude + correction;
    
    return {
      correctedAltitude,
      correction
    };
  }

  destroy(): void {
    // Event listeners are automatically removed when container is cleared
    this.container = null;
  }
}