import { ITool } from './ITool';
import * as mgrs from 'mgrs';

type CoordinateFormat = 'dd' | 'dm' | 'dms' | 'mgrs';

type CoordinatePair = { lat: number; lon: number };

/**
 * Coordinates Conversion Tool
 * Converts between DD, DM, DMS, and MGRS coordinates
 */
export class CoordinatesConversion implements ITool {
  id = 'coordinates-conversion';
  name = 'Coordinates Conversion';
  description = 'Convert between DD, DM, DMS, and 5-digit MGRS coordinates';

  private container: HTMLElement | null = null;

  render(container: HTMLElement): void {
    this.container = container;

    container.innerHTML = `
      <div class="tool-content">
        <h2>Coordinates Conversion</h2>
        <p class="tool-description">
          Convert between Decimal Degrees (DD), Degrees + Decimal Minutes (DM),
          Degrees + Minutes + Seconds (DMS) and 5-digit Military Grid Reference System (MGRS).
        </p>

        <div class="input-group">
          <label for="coordinate-format">Input format</label>
          <select id="coordinate-format">
            <option value="dd">Decimal Degrees (DD)</option>
            <option value="dm">Degrees + Decimal Minutes (DM)</option>
            <option value="dms">Degrees + Minutes + Seconds (DMS)</option>
            <option value="mgrs">MGRS (5-digit)</option>
          </select>
        </div>

        <div id="coordinate-inputs"></div>

        <button id="convert-coordinates" class="btn-primary">Convert</button>

        <div id="conversion-result" class="result hidden">
          <h3>Converted Coordinates</h3>
          <div class="result-grid">
            <div class="result-value">
              <div class="label">Decimal Degrees (DD)</div>
              <div class="value" id="result-dd">-</div>
              <button class="btn-secondary copy-btn" data-copy-target="result-dd">Copy</button>
            </div>
            <div class="result-value">
              <div class="label">Degrees + Decimal Minutes (DM)</div>
              <div class="value" id="result-dm">-</div>
              <button class="btn-secondary copy-btn" data-copy-target="result-dm">Copy</button>
            </div>
            <div class="result-value">
              <div class="label">Degrees + Minutes + Seconds (DMS)</div>
              <div class="value" id="result-dms">-</div>
              <button class="btn-secondary copy-btn" data-copy-target="result-dms">Copy</button>
            </div>
            <div class="result-value">
              <div class="label">MGRS (5-digit)</div>
              <div class="value" id="result-mgrs">-</div>
              <button class="btn-secondary copy-btn" data-copy-target="result-mgrs">Copy</button>
            </div>
          </div>
          <div class="result-info">
            <p>Copy any format to quickly share coordinates across devices or systems.</p>
          </div>
        </div>
      </div>
    `;

    this.renderInputFields('dd');
    this.attachEventListeners();
  }

  destroy(): void {
    this.container = null;
  }

  private attachEventListeners(): void {
    const formatSelect = this.container?.querySelector('#coordinate-format') as HTMLSelectElement | null;
    const convertBtn = this.container?.querySelector('#convert-coordinates');

    formatSelect?.addEventListener('change', (event) => {
      const value = (event.target as HTMLSelectElement).value as CoordinateFormat;
      this.renderInputFields(value);
    });

    convertBtn?.addEventListener('click', () => {
      const format = formatSelect?.value as CoordinateFormat;
      this.handleConversion(format);
    });
  }

  private renderInputFields(format: CoordinateFormat): void {
    const inputsContainer = this.container?.querySelector('#coordinate-inputs');
    if (!inputsContainer) return;

    if (format === 'mgrs') {
      inputsContainer.innerHTML = `
        <div class="input-group">
          <label for="mgrs-input">MGRS Coordinate</label>
          <input type="text" id="mgrs-input" placeholder="33UXP0406551" />
          <small>Enter a 5-digit precision MGRS coordinate (e.g., 33UXP0406551).</small>
        </div>
      `;
      return;
    }

    const placeholders: Record<CoordinateFormat, { lat: string; lon: string; helper: string }> = {
      dd: {
        lat: '48.85837',
        lon: '2.29448',
        helper: 'Enter latitude and longitude in decimal degrees. North/East positive, South/West negative.'
      },
      dm: {
        lat: "48° 51.502' N",
        lon: "2° 17.669' E",
        helper: 'Enter degrees and decimal minutes with hemisphere (e.g., 48° 51.502\' N).'
      },
      dms: {
        lat: '48° 51\' 8.9" N',
        lon: '2° 17\' 40.1" E',
        helper: 'Enter degrees, minutes, seconds with hemisphere (e.g., 48° 51\' 8.9\" N).'
      },
      mgrs: { lat: '', lon: '', helper: '' }
    };

    const { lat, lon, helper } = placeholders[format];
    inputsContainer.innerHTML = `
      <div class="input-group">
        <label for="lat-input">Latitude</label>
        <input type="text" id="lat-input" placeholder="${lat}" />
      </div>
      <div class="input-group">
        <label for="lon-input">Longitude</label>
        <input type="text" id="lon-input" placeholder="${lon}" />
        <small>${helper}</small>
      </div>
    `;
  }

  private handleConversion(format: CoordinateFormat): void {
    try {
      const coordinates = this.parseCoordinates(format);
      this.displayResults(coordinates);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to convert coordinates. Please check your input.';
      alert(message);
    }
  }

  private parseCoordinates(format: CoordinateFormat): CoordinatePair {
    switch (format) {
      case 'dd':
        return this.parseDecimalDegrees();
      case 'dm':
        return this.parseDegreesMinutes(false);
      case 'dms':
        return this.parseDegreesMinutes(true);
      case 'mgrs':
        return this.parseMgrs();
      default:
        throw new Error('Unsupported format selected.');
    }
  }

  private parseDecimalDegrees(): CoordinatePair {
    const latInput = this.container?.querySelector('#lat-input') as HTMLInputElement | null;
    const lonInput = this.container?.querySelector('#lon-input') as HTMLInputElement | null;

    const lat = parseFloat(latInput?.value ?? '');
    const lon = parseFloat(lonInput?.value ?? '');

    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      throw new Error('Please provide numeric latitude and longitude values.');
    }

    this.validateRange(lat, lon);
    return { lat, lon };
  }

  private parseDegreesMinutes(expectSeconds: boolean): CoordinatePair {
    const latInput = this.container?.querySelector('#lat-input') as HTMLInputElement | null;
    const lonInput = this.container?.querySelector('#lon-input') as HTMLInputElement | null;

    const lat = this.parseCoordinateString(latInput?.value ?? '', expectSeconds, true);
    const lon = this.parseCoordinateString(lonInput?.value ?? '', expectSeconds, false);

    this.validateRange(lat, lon);
    return { lat, lon };
  }

  private parseCoordinateString(value: string, expectSeconds: boolean, isLat: boolean): number {
    const trimmed = value.trim().toUpperCase();

    const match = trimmed.match(/^(N|S|E|W)?\s*(-?\d+(?:\.\d+)?)\s*[°\s]\s*(\d+(?:\.\d+)?)(?:['\s]\s*(\d+(?:\.\d+)?))?\s*(N|S|E|W)?$/);

    if (!match) {
      const formatLabel = expectSeconds ? 'DMS' : 'DM';
      throw new Error(`Could not parse ${formatLabel} value: "${value}"`);
    }

    const [, prefixDir, degreesStr, minutesStr, secondsStr, suffixDir] = match;
    const degrees = parseFloat(degreesStr);
    const minutes = parseFloat(minutesStr);
    const seconds = secondsStr ? parseFloat(secondsStr) : 0;

    if (Number.isNaN(degrees) || Number.isNaN(minutes) || (expectSeconds && Number.isNaN(seconds))) {
      throw new Error('Degrees, minutes, or seconds are invalid numbers.');
    }

    if (minutes < 0 || minutes >= 60 || seconds < 0 || seconds >= 60) {
      throw new Error('Minutes and seconds must be between 0 and 59.');
    }

    if (expectSeconds && secondsStr === undefined) {
      throw new Error('Please include seconds for DMS coordinates.');
    }

    const direction = prefixDir || suffixDir || '';
    const sign = this.getSignFromDirection(direction, isLat, degrees);

    return sign * (Math.abs(degrees) + minutes / 60 + seconds / 3600);
  }

  private parseMgrs(): CoordinatePair {
    const mgrsInput = this.container?.querySelector('#mgrs-input') as HTMLInputElement | null;
    const mgrsValue = mgrsInput?.value.trim();

    if (!mgrsValue) {
      throw new Error('Please enter an MGRS coordinate.');
    }

    const cleaned = mgrsValue.replace(/\s+/g, '');

    try {
      const [lon, lat] = mgrs.toPoint(cleaned.toUpperCase());
      this.validateRange(lat, lon);
      return { lat, lon };
    } catch (error) {
      throw new Error('Invalid MGRS coordinate. Please check the grid zone and digits.');
    }
  }

  private displayResults({ lat, lon }: CoordinatePair): void {
    const ddField = this.container?.querySelector('#result-dd');
    const dmField = this.container?.querySelector('#result-dm');
    const dmsField = this.container?.querySelector('#result-dms');
    const mgrsField = this.container?.querySelector('#result-mgrs');
    const resultCard = this.container?.querySelector('#conversion-result');

    const ddText = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    const dmText = `${this.formatDegreesMinutes(lat, true)}, ${this.formatDegreesMinutes(lon, false)}`;
    const dmsText = `${this.formatDms(lat, true)}, ${this.formatDms(lon, false)}`;
    const mgrsText = mgrs.forward([lon, lat], 5);

    if (ddField) ddField.textContent = ddText;
    if (dmField) dmField.textContent = dmText;
    if (dmsField) dmsField.textContent = dmsText;
    if (mgrsField) mgrsField.textContent = mgrsText;
    resultCard?.classList.remove('hidden');

    this.registerCopyHandlers();
  }

  private registerCopyHandlers(): void {
    const copyButtons = this.container?.querySelectorAll('[data-copy-target]');
    copyButtons?.forEach(button => {
      const targetId = (button as HTMLElement).getAttribute('data-copy-target');
      const handler = () => {
        if (!targetId) return;
        const target = this.container?.querySelector(`#${targetId}`);
        const text = target?.textContent;
        if (!text) return;
        navigator.clipboard.writeText(text).catch(() => alert('Unable to copy to clipboard.'));
      };
      (button as HTMLButtonElement).onclick = handler;
    });
  }

  private validateRange(lat: number, lon: number): void {
    if (lat < -90 || lat > 90) {
      throw new Error('Latitude must be between -90 and 90 degrees.');
    }
    if (lon < -180 || lon > 180) {
      throw new Error('Longitude must be between -180 and 180 degrees.');
    }
  }

  private getSignFromDirection(direction: string, isLat: boolean, degrees: number): number {
    const normalized = direction.toUpperCase();
    const allowed = isLat ? ['N', 'S'] : ['E', 'W'];

    if (normalized && !allowed.includes(normalized)) {
      const coordLabel = isLat ? 'latitude' : 'longitude';
      throw new Error(`Use ${allowed.join(' or ')} for ${coordLabel} directions.`);
    }

    if (normalized === 'S' || normalized === 'W') return -1;
    if (normalized === 'N' || normalized === 'E') return 1;
    return degrees < 0 ? -1 : 1;
  }

  private formatDegreesMinutes(value: number, isLat: boolean): string {
    const abs = Math.abs(value);
    const degrees = Math.floor(abs);
    const minutes = (abs - degrees) * 60;
    const direction = this.getDirection(value, isLat);
    return `${degrees}° ${minutes.toFixed(3)}' ${direction}`;
  }

  private formatDms(value: number, isLat: boolean): string {
    const abs = Math.abs(value);
    const degrees = Math.floor(abs);
    const totalMinutes = (abs - degrees) * 60;
    const minutes = Math.floor(totalMinutes);
    const seconds = (totalMinutes - minutes) * 60;
    const direction = this.getDirection(value, isLat);
    return `${degrees}° ${minutes}' ${seconds.toFixed(1)}" ${direction}`;
  }

  private getDirection(value: number, isLat: boolean): 'N' | 'S' | 'E' | 'W' {
    if (isLat) {
      return value >= 0 ? 'N' : 'S';
    }
    return value >= 0 ? 'E' : 'W';
  }
}
