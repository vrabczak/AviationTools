import { ITool } from './ITool';
import { jsx } from '../jsx-runtime';

type DistanceUnit = 'm' | 'km' | 'nm' | 'ft' | 'sm';

/**
 * Distance Conversion Tool
 * Converts between m, km, NM, ft, and SM
 */
export class DistanceConversion implements ITool {
  id = 'distance-conversion';
  name = 'Distance Conversion';
  description = 'Convert between m, km, NM, ft, and SM';

  private container: HTMLElement | null = null;

  // Conversion factors to meters (base unit)
  private static readonly TO_M: Record<DistanceUnit, number> = {
    m: 1,
    km: 1000,
    nm: 1852,
    ft: 0.3048,
    sm: 1609.344,
  };

  // Conversion factors from meters
  private static readonly FROM_M: Record<DistanceUnit, number> = {
    m: 1,
    km: 1 / 1000,
    nm: 1 / 1852,
    ft: 1 / 0.3048,
    sm: 1 / 1609.344,
  };

  render(container: HTMLElement): void {
    this.container = container;

    const content = (
      <div class="tool-content">
        <h2>Distance Conversion</h2>
        <p class="tool-description">
          Convert between Meters (m), Kilometers (km),
          Nautical Miles (NM), Feet (ft), and Statute Miles (SM).
        </p>

        <div class="input-group">
          <label for="distance-unit">Input unit</label>
          <select id="distance-unit">
            <option value="m">Meters (m)</option>
            <option value="km">Kilometers (km)</option>
            <option value="nm">Nautical Miles (NM)</option>
            <option value="ft">Feet (ft)</option>
            <option value="sm">Statute Miles (SM)</option>
          </select>
        </div>

        <div class="input-group">
          <label for="distance-input">Distance value</label>
          <input type="number" id="distance-input" placeholder="100" step="any" />
          <small>Enter a positive numeric distance value.</small>
        </div>

        <button id="convert-distance" class="btn-primary">Convert</button>

        <div id="conversion-result" class="result hidden">
          <h3>Converted Distances</h3>
          <div class="result-grid">
            <div class="result-value" id="result-row-m">
              <div class="label">Meters (m)</div>
              <div class="value" id="result-m">-</div>
              <button class="btn-secondary copy-btn" data-copy-target="result-m">Copy</button>
            </div>
            <div class="result-value" id="result-row-km">
              <div class="label">Kilometers (km)</div>
              <div class="value" id="result-km">-</div>
              <button class="btn-secondary copy-btn" data-copy-target="result-km">Copy</button>
            </div>
            <div class="result-value" id="result-row-nm">
              <div class="label">Nautical Miles (NM)</div>
              <div class="value" id="result-nm">-</div>
              <button class="btn-secondary copy-btn" data-copy-target="result-nm">Copy</button>
            </div>
            <div class="result-value" id="result-row-ft">
              <div class="label">Feet (ft)</div>
              <div class="value" id="result-ft">-</div>
              <button class="btn-secondary copy-btn" data-copy-target="result-ft">Copy</button>
            </div>
            <div class="result-value" id="result-row-sm">
              <div class="label">Statute Miles (SM)</div>
              <div class="value" id="result-sm">-</div>
              <button class="btn-secondary copy-btn" data-copy-target="result-sm">Copy</button>
            </div>
          </div>
          <div class="result-info">
            <p>Copy any format to quickly share distance values across devices or systems.</p>
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
    const convertBtn = this.container?.querySelector('#convert-distance');
    const distanceInput = this.container?.querySelector('#distance-input') as HTMLInputElement | null;

    convertBtn?.addEventListener('click', () => {
      this.handleConversion();
    });

    // Allow Enter key to trigger conversion
    distanceInput?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        this.handleConversion();
      }
    });
  }

  private handleConversion(): void {
    try {
      const unitSelect = this.container?.querySelector('#distance-unit') as HTMLSelectElement | null;
      const distanceInput = this.container?.querySelector('#distance-input') as HTMLInputElement | null;

      const unit = unitSelect?.value as DistanceUnit;
      const value = parseFloat(distanceInput?.value ?? '');

      if (Number.isNaN(value)) {
        throw new Error('Please enter a valid numeric distance value.');
      }

      if (value < 0) {
        throw new Error('Distance value must be positive.');
      }

      this.displayResults(value, unit);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to convert distance. Please check your input.';
      alert(message);
    }
  }

  private convert(value: number, fromUnit: DistanceUnit, toUnit: DistanceUnit): number {
    const meters = value * DistanceConversion.TO_M[fromUnit];
    return meters * DistanceConversion.FROM_M[toUnit];
  }

  private displayResults(value: number, fromUnit: DistanceUnit): void {
    const mField = this.container?.querySelector('#result-m');
    const kmField = this.container?.querySelector('#result-km');
    const nmField = this.container?.querySelector('#result-nm');
    const ftField = this.container?.querySelector('#result-ft');
    const smField = this.container?.querySelector('#result-sm');
    const resultCard = this.container?.querySelector('#conversion-result');

    const m = this.convert(value, fromUnit, 'm');
    const km = this.convert(value, fromUnit, 'km');
    const nm = this.convert(value, fromUnit, 'nm');
    const ft = this.convert(value, fromUnit, 'ft');
    const sm = this.convert(value, fromUnit, 'sm');

    if (mField) mField.textContent = `${this.formatNumber(m)} m`;
    if (kmField) kmField.textContent = `${this.formatNumber(km)} km`;
    if (nmField) nmField.textContent = `${this.formatNumber(nm)} NM`;
    if (ftField) ftField.textContent = `${this.formatNumber(ft)} ft`;
    if (smField) smField.textContent = `${this.formatNumber(sm)} SM`;

    // Hide the input unit row, show others
    const units: DistanceUnit[] = ['m', 'km', 'nm', 'ft', 'sm'];
    units.forEach(unit => {
      const row = this.container?.querySelector(`#result-row-${unit}`) as HTMLElement | null;
      if (row) {
        row.style.display = unit === fromUnit ? 'none' : '';
      }
    });

    resultCard?.classList.remove('hidden');
    if (resultCard) {
      try {
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (_) {
        (resultCard as HTMLElement).scrollIntoView();
      }
    }

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
