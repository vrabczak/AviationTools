import { ITool } from './ITool';
import { jsx } from '../jsx-runtime';

type SpeedUnit = 'kt' | 'kmh' | 'ms' | 'ftmin';

/**
 * Speed Conversion Tool
 * Converts between kt, km/h, m/s, and ft/min
 */
export class SpeedConversion implements ITool {
  id = 'speed-conversion';
  name = 'Speed Conversion';
  description = 'Convert between kt, km/h, m/s, and ft/min';

  private container: HTMLElement | null = null;

  // Conversion factors to m/s (base unit)
  private static readonly TO_MS: Record<SpeedUnit, number> = {
    kt: 0.514444,
    kmh: 1 / 3.6,
    ms: 1,
    ftmin: 0.00508,
  };

  // Conversion factors from m/s
  private static readonly FROM_MS: Record<SpeedUnit, number> = {
    kt: 1 / 0.514444,
    kmh: 3.6,
    ms: 1,
    ftmin: 1 / 0.00508,
  };


  render(container: HTMLElement): void {
    this.container = container;

    const content = (
      <div class="tool-content">
        <h2>Speed Conversion</h2>
        <p class="tool-description">
          Convert between Knots (kt), Kilometers per hour (km/h),
          Meters per second (m/s), and Feet per minute (ft/min).
        </p>

        <div class="input-group">
          <label for="speed-unit">Input unit</label>
          <select id="speed-unit">
            <option value="kt">Knots (kt)</option>
            <option value="kmh">Kilometers per hour (km/h)</option>
            <option value="ms">Meters per second (m/s)</option>
            <option value="ftmin">Feet per minute (ft/min)</option>
          </select>
        </div>

        <div class="input-group">
          <label for="speed-input">Speed value</label>
          <input type="number" id="speed-input" placeholder="100" step="any" />
          <small>Enter a positive numeric speed value.</small>
        </div>

        <button id="convert-speed" class="btn-primary">Convert</button>

        <div id="conversion-result" class="result hidden">
          <h3>Converted Speeds</h3>
          <div class="result-grid">
            <div class="result-value" id="result-row-kt">
              <div class="label">Knots (kt)</div>
              <div class="value" id="result-kt">-</div>
              <button class="btn-secondary copy-btn" data-copy-target="result-kt">Copy</button>
            </div>
            <div class="result-value" id="result-row-kmh">
              <div class="label">Kilometers per hour (km/h)</div>
              <div class="value" id="result-kmh">-</div>
              <button class="btn-secondary copy-btn" data-copy-target="result-kmh">Copy</button>
            </div>
            <div class="result-value" id="result-row-ms">
              <div class="label">Meters per second (m/s)</div>
              <div class="value" id="result-ms">-</div>
              <button class="btn-secondary copy-btn" data-copy-target="result-ms">Copy</button>
            </div>
            <div class="result-value" id="result-row-ftmin">
              <div class="label">Feet per minute (ft/min)</div>
              <div class="value" id="result-ftmin">-</div>
              <button class="btn-secondary copy-btn" data-copy-target="result-ftmin">Copy</button>
            </div>
          </div>
          <div class="result-info">
            <p>Copy any format to quickly share speed values across devices or systems.</p>
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
    const convertBtn = this.container?.querySelector('#convert-speed');
    const speedInput = this.container?.querySelector('#speed-input') as HTMLInputElement | null;

    convertBtn?.addEventListener('click', () => {
      this.handleConversion();
    });

    // Allow Enter key to trigger conversion
    speedInput?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        this.handleConversion();
      }
    });
  }

  private handleConversion(): void {
    try {
      const unitSelect = this.container?.querySelector('#speed-unit') as HTMLSelectElement | null;
      const speedInput = this.container?.querySelector('#speed-input') as HTMLInputElement | null;

      const unit = unitSelect?.value as SpeedUnit;
      const value = parseFloat(speedInput?.value ?? '');

      if (Number.isNaN(value)) {
        throw new Error('Please enter a valid numeric speed value.');
      }

      if (value < 0) {
        throw new Error('Speed value must be positive.');
      }

      this.displayResults(value, unit);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to convert speed. Please check your input.';
      alert(message);
    }
  }

  private convert(value: number, fromUnit: SpeedUnit, toUnit: SpeedUnit): number {
    const ms = value * SpeedConversion.TO_MS[fromUnit];
    return ms * SpeedConversion.FROM_MS[toUnit];
  }

  private displayResults(value: number, fromUnit: SpeedUnit): void {
    const ktField = this.container?.querySelector('#result-kt');
    const kmhField = this.container?.querySelector('#result-kmh');
    const msField = this.container?.querySelector('#result-ms');
    const ftminField = this.container?.querySelector('#result-ftmin');
    const resultCard = this.container?.querySelector('#conversion-result');

    const kt = this.convert(value, fromUnit, 'kt');
    const kmh = this.convert(value, fromUnit, 'kmh');
    const ms = this.convert(value, fromUnit, 'ms');
    const ftmin = this.convert(value, fromUnit, 'ftmin');

    if (ktField) ktField.textContent = `${this.formatNumber(kt)} kt`;
    if (kmhField) kmhField.textContent = `${this.formatNumber(kmh)} km/h`;
    if (msField) msField.textContent = `${this.formatNumber(ms)} m/s`;
    if (ftminField) ftminField.textContent = `${this.formatNumber(ftmin)} ft/min`;

    // Hide the input unit row, show others
    const units: SpeedUnit[] = ['kt', 'kmh', 'ms', 'ftmin'];
    units.forEach(unit => {
      const row = this.container?.querySelector(`#result-row-${unit}`) as HTMLElement | null;
      if (row) {
        row.style.display = unit === fromUnit ? 'none' : '';
      }
    });

    resultCard?.classList.remove('hidden');

    this.registerCopyHandlers();
  }

  private formatNumber(value: number): string {
    // Use appropriate precision based on magnitude
    if (value >= 1000) {
      return value.toFixed(1);
    } else if (value >= 100) {
      return value.toFixed(2);
    } else if (value >= 10) {
      return value.toFixed(3);
    } else {
      return value.toFixed(4);
    }
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
        
        const btnElement = button as HTMLButtonElement;
        const originalText = btnElement.textContent;
        
        // Try modern clipboard API first
        const nav = navigator as Navigator;
        if (nav.clipboard && nav.clipboard.writeText) {
          nav.clipboard.writeText(text)
            .then(() => this.showCopySuccess(btnElement, originalText))
            .catch(() => this.fallbackCopy(text, btnElement, originalText));
        } else {
          // Fallback for older browsers and iOS/iPad
          this.fallbackCopy(text, btnElement, originalText);
        }
      };
      (button as HTMLButtonElement).onclick = handler;
    });
  }

  private fallbackCopy(text: string, button: HTMLButtonElement, originalText: string | null): void {
    // Create a temporary textarea element
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    textarea.setAttribute('readonly', '');
    document.body.appendChild(textarea);
    
    // Select and copy the text
    textarea.select();
    textarea.setSelectionRange(0, 99999); // For mobile devices
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        this.showCopySuccess(button, originalText);
      } else {
        alert('Unable to copy to clipboard.');
      }
    } catch (error) {
      alert('Unable to copy to clipboard.');
    } finally {
      document.body.removeChild(textarea);
    }
  }

  private showCopySuccess(button: HTMLButtonElement, originalText: string | null): void {
    button.textContent = 'Copied!';
    button.style.backgroundColor = '#10b981';
    button.style.color = '#ffffff';
    
    setTimeout(() => {
      button.textContent = originalText || 'Copy';
      button.style.backgroundColor = '';
      button.style.color = '';
    }, 2000);
  }
}
