import { ITool } from './ITool';
import { jsx } from '../jsx-runtime';

/**
 * Approach Table Tool
 * Generates a table showing distance, altitude, and height above TDZ for approach
 */
export class ApproachTable implements ITool {
  id = 'approach-table';
  name = 'Approach Table';
  description = 'Generate approach table with distances, altitudes, and heights above TDZ';

  private container: HTMLElement | null = null;

  render(container: HTMLElement): void {
    this.container = container;
    
    const content = (
      <div class="tool-content">
        <h2>Approach Table</h2>
        <p class="tool-description">
          Generate a table showing distance to touchdown zone (TDZ), altitude, and height above TDZ
          for a given glide slope angle. Useful for approach planning and monitoring.
        </p>
        
        <div class="input-group">
          <label for="tdz-altitude">Touch Down Zone Altitude (ft):</label>
          <input type="number" id="tdz-altitude" placeholder="e.g., 1500" step="1" />
          <small>Altitude of the touchdown zone in feet</small>
        </div>
        
        <div class="input-group">
          <label for="slope-angle">Glide Slope Angle (°):</label>
          <input type="number" id="slope-angle" placeholder="3" step="0.1" value="3" />
          <small>Approach slope angle in degrees (default: 3°)</small>
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
    const tdzAltitude = parseFloat(
      (this.container?.querySelector('#tdz-altitude') as HTMLInputElement)?.value
    );
    const slopeAngle = parseFloat(
      (this.container?.querySelector('#slope-angle') as HTMLInputElement)?.value
    );

    if (isNaN(tdzAltitude)) {
      alert('Please enter a valid TDZ altitude');
      return;
    }

    if (isNaN(slopeAngle) || slopeAngle <= 0 || slopeAngle > 60) {
      alert('Please enter a valid slope angle (0-60°)');
      return;
    }

    // Generate table data
    const tableData = this.calculateApproachTable(tdzAltitude, slopeAngle);

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
                <th>Distance (NM)</th>
                <th>Distance (km)</th>
                <th>Altitude (ft)</th>
                <th>Height (ft)</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map(row => (
                <tr>
                  <td>{row.distanceNM}</td>
                  <td>{row.distanceKm.toFixed(2)}</td>
                  <td>{Math.round(row.altitude).toLocaleString()}</td>
                  <td>{Math.round(row.heightAboveTDZ).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div class="result-info">
            <p>Glide slope: {slopeAngle}° | TDZ elevation: {tdzAltitude.toLocaleString()} ft</p>
          </div>
        </div>
      );
      
      tableContainer.appendChild(tableElement as Node);
    }
  }

  private calculateApproachTable(
    tdzAltitude: number,
    slopeAngle: number
  ): Array<{ distanceNM: number; distanceKm: number; altitude: number; heightAboveTDZ: number }> {
    const NM_TO_KM = 1.852;
    const NM_TO_FEET = 6076.12; // 1 NM = 6076.12 feet
    
    const results = [];
    
    // Calculate for 1-10 NM
    for (let distanceNM = 1; distanceNM <= 10; distanceNM++) {
      const distanceKm = distanceNM * NM_TO_KM;
      const distanceFeet = distanceNM * NM_TO_FEET;
      
      // Height above TDZ = distance * tan(slope angle)
      const slopeRadians = (slopeAngle * Math.PI) / 180;
      const heightAboveTDZ = distanceFeet * Math.tan(slopeRadians);
      
      // Altitude = TDZ altitude + height above TDZ
      const altitude = tdzAltitude + heightAboveTDZ;
      
      results.push({
        distanceNM,
        distanceKm,
        altitude,
        heightAboveTDZ
      });
    }
    
    return results;
  }

  destroy(): void {
    this.container = null;
  }
}
