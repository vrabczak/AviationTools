import { ITool } from './ITool';
import { jsx } from '../jsx-runtime';

/**
 * Approach Table Tool
 * Generates a table showing distance, altitude, and height above Target Altitude for approach
 */
export class ApproachTable implements ITool {
  id = 'approach-table';
  name = 'Approach Table';
  description = 'Generate approach table with distances, altitudes, and heights above Target Altitude';

  private container: HTMLElement | null = null;

  render(container: HTMLElement): void {
    this.container = container;
    
    const content = (
      <div class="tool-content">
        <h2>Approach Table</h2>
        <p class="tool-description">
          Generate a table showing distance to Target Altitude, Altitude Above and Height Above
          for a given glide slope angle. Useful for approach planning and monitoring.
        </p>
        
        <div class="input-group">
          <label for="target-altitude">Target Altitude:</label>
          <div style="display:flex; gap:8px; align-items:center;">
            <input type="number" id="target-altitude" placeholder="e.g., 1500" step="1" />
            <select id="altitude-unit" aria-label="Altitude unit">
              <option value="ft" selected>ft</option>
              <option value="m">m</option>
            </select>
          </div>
          <small>Enter target altitude in the selected unit</small>
        </div>
        
        <div class="input-group">
          <label for="slope-angle">Glide Slope Angle (°):</label>
          <input type="number" id="slope-angle" placeholder="3" step="0.1" value="3" />
          <small>Approach slope angle in degrees (default: 3°)</small>
        </div>
        
        <div class="input-group">
          <label for="ground-speed">Ground Speed (kt):</label>
          <input type="number" id="ground-speed" placeholder="e.g., 100" step="1" min="1" />
          <small>Ground speed in knots (optional, for vertical speed calculation)</small>
        </div>

        <div class="input-group">
          <label for="distance-unit">Distance Unit:</label>
          <select id="distance-unit" aria-label="Distance unit">
            <option value="NM" selected>NM</option>
            <option value="km">km</option>
          </select>
        </div>
        
        <button id="generate-table" class="btn-primary">Generate Table</button>
        
        <div id="approach-result" class="result hidden">
          <h3>Approach Table:</h3>
          <div id="approach-table-container" class="table-container"></div>
        </div>
      </div>
    );

    container.appendChild(content as Node);
    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const generateBtn = this.container?.querySelector('#generate-table');
    generateBtn?.addEventListener('click', () => this.generateTable());

    // Allow Enter key to trigger calculation
    const inputs = this.container?.querySelectorAll('input');
    inputs?.forEach(input => {
      input.addEventListener('keypress', (e: Event) => {
        if ((e as KeyboardEvent).key === 'Enter') {
          this.generateTable();
        }
      });
    });
  }

  private generateTable(): void {
    const altitudeUnit = (this.container?.querySelector('#altitude-unit') as HTMLSelectElement)?.value || 'ft';
    const distanceUnit = (this.container?.querySelector('#distance-unit') as HTMLSelectElement)?.value || 'NM';
    const targetAltitudeInput = parseFloat(
      (this.container?.querySelector('#target-altitude') as HTMLInputElement)?.value
    );
    const slopeAngle = parseFloat(
      (this.container?.querySelector('#slope-angle') as HTMLInputElement)?.value
    );
    const groundSpeed = parseFloat(
      (this.container?.querySelector('#ground-speed') as HTMLInputElement)?.value
    );

    if (isNaN(targetAltitudeInput)) {
      alert('Please enter a valid Target Altitude');
      return;
    }

    if (isNaN(slopeAngle) || slopeAngle < 0 || slopeAngle > 60) {
      alert('Please enter a valid slope angle (0-60°)');
      return;
    }

    // Convert target altitude to feet for internal calculations if needed
    const targetAltitudeFt = altitudeUnit === 'm' ? targetAltitudeInput * 3.28084 : targetAltitudeInput;

    // Generate table data
    const tableData = this.calculateApproachTable(targetAltitudeFt, slopeAngle);

    // Display result
    const resultDiv = this.container?.querySelector('#approach-result');
    const tableContainer = this.container?.querySelector('#approach-table-container');

    if (resultDiv && tableContainer) {
      resultDiv.classList.remove('hidden');
      
      // Clear previous content
      tableContainer.innerHTML = '';
      
      // Create table using JSX
      const tableElement = (
        <div>
          <table class="approach-table">
            <thead>
              <tr>
                <th>Distance ({distanceUnit})</th>
                <th>Altitude ({altitudeUnit})</th>
                <th>Height ({altitudeUnit})</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map(row => (
                <tr>
                  <td>{distanceUnit === 'NM' ? row.distanceNM : row.distanceKM}</td>
                  <td>{
                    (() => {
                      const val = altitudeUnit === 'm' ? row.altitudeAbove / 3.28084 : row.altitudeAbove;
                      return Math.round(val).toLocaleString();
                    })()
                  }</td>
                  <td>{
                    (() => {
                      const val = altitudeUnit === 'm' ? row.heightAbove / 3.28084 : row.heightAbove;
                      return Math.round(val).toLocaleString();
                    })()
                  }</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div class="result-info">
            <p>
              Glide slope: {slopeAngle}° |
              {' '}Target Altitude: {(
                altitudeUnit === 'm'
                  ? Math.round(targetAltitudeFt / 3.28084).toLocaleString() + ' m'
                  : Math.round(targetAltitudeFt).toLocaleString() + ' ft'
              )}
            </p>
            {!isNaN(groundSpeed) && groundSpeed > 0 && (
              <p>
                {(() => {
                  const vsFtMin = groundSpeed * Math.tan(slopeAngle * Math.PI / 180) * 101.27;
                  if (altitudeUnit === 'm') {
                    const vsMMin = vsFtMin / 3.28084;
                    return `Target Vertical Speed: ${Math.round(vsMMin)} m/min`;
                  }
                  return `Target Vertical Speed: ${Math.round(vsFtMin)} ft/min`;
                })()}
              </p>
            )}
          </div>
        </div>
      );
      
      tableContainer.appendChild(tableElement as Node);
    }
  }

  private calculateApproachTable(
    targetAltitude: number,
    slopeAngle: number
  ): Array<{ distanceNM: number; distanceKM: string; altitudeAbove: number; heightAbove: number }> {
    const NM_TO_FEET = 6076.12; // 1 NM = 6076.12 feet
    const NM_TO_KM = 1.852; // 1 NM = 1.852 km
    
    const results = [];
    
    // Calculate for 1-10 NM
    for (let distanceNM = 1; distanceNM <= 10; distanceNM++) {
      const distanceFeet = distanceNM * NM_TO_FEET;
      const distanceKM = (distanceNM * NM_TO_KM).toFixed(1);
      
      // Height above = distance * tan(slope angle)
      const slopeRadians = (slopeAngle * Math.PI) / 180;
      const heightAbove = distanceFeet * Math.tan(slopeRadians);
      
      // Altitude above = target altitude + height above
      const altitudeAbove = targetAltitude + heightAbove;
      
      results.push({
        distanceNM,
        distanceKM,
        altitudeAbove,
        heightAbove
      });
    }
    
    return results;
  }

  destroy(): void {
    this.container = null;
  }
}
