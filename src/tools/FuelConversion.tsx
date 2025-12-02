import { ITool } from './ITool';
import { jsx } from '../jsx-runtime';

type FuelUnit = 'liters' | 'kg' | 'gallon' | 'pound';

/**
 * Fuel Conversion Tool
 * Converts between volume and weight units for aviation fuel
 */
export class FuelConversion implements ITool {
  id = 'fuel-conversion';
  name = 'Fuel Conversion';
  description = 'Convert between liters, kg, gallons, and pounds using fuel density';

  private container: HTMLElement | null = null;

  // Conversion constants
  private readonly LITERS_PER_GALLON = 3.785411784;
  private readonly KG_PER_POUND = 0.45359237;

  render(container: HTMLElement): void {
    this.container = container;

    const content = (
      <div class="tool-content">
        <h2>Fuel Conversion</h2>
        <p class="tool-description">
          Convert between volume (liters, gallons) and weight (kg, pounds) units for aviation fuel.
          Adjust the density based on fuel type (default 0.8 kg/L for Jet A-1).
        </p>

        <div class="input-group">
          <label for="fuel-unit">Unit</label>
          <select id="fuel-unit">
            <option value="liters">Liters (L)</option>
            <option value="kg">Kilograms (kg)</option>
            <option value="gallon">US Gallons (gal)</option>
            <option value="pound">Pounds (lb)</option>
          </select>
        </div>

        <div class="input-group">
          <label for="fuel-value">Value</label>
          <input type="number" id="fuel-value" placeholder="Enter value" step="any" />
        </div>

        <div class="input-group">
          <label for="fuel-density">Density (kg/L)</label>
          <input type="number" id="fuel-density" placeholder="0.8" step="0.01" value="0.8" />
          <small>Typical values: Jet A-1 ≈ 0.8, Avgas 100LL ≈ 0.72</small>
        </div>

        <button id="convert-fuel" class="btn-primary">Convert</button>

        <div id="fuel-result" class="result hidden">
          <h3>Converted Values</h3>
          <div class="result-grid">
            <div class="result-value">
              <div class="label">Liters (L)</div>
              <div class="value" id="result-liters">-</div>
              <button class="btn-secondary copy-btn" data-copy-target="result-liters">Copy</button>
            </div>
            <div class="result-value">
              <div class="label">Kilograms (kg)</div>
              <div class="value" id="result-kg">-</div>
              <button class="btn-secondary copy-btn" data-copy-target="result-kg">Copy</button>
            </div>
            <div class="result-value">
              <div class="label">US Gallons (gal)</div>
              <div class="value" id="result-gallon">-</div>
              <button class="btn-secondary copy-btn" data-copy-target="result-gallon">Copy</button>
            </div>
            <div class="result-value">
              <div class="label">Pounds (lb)</div>
              <div class="value" id="result-pound">-</div>
              <button class="btn-secondary copy-btn" data-copy-target="result-pound">Copy</button>
            </div>
          </div>
          <div class="result-info">
            <p>Conversions are based on the specified fuel density.</p>
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
    const convertBtn = this.container?.querySelector('#convert-fuel');

    convertBtn?.addEventListener('click', () => {
      this.handleConversion();
    });
  }

  private handleConversion(): void {
    try {
      const unitSelect = this.container?.querySelector('#fuel-unit') as HTMLSelectElement | null;
      const valueInput = this.container?.querySelector('#fuel-value') as HTMLInputElement | null;
      const densityInput = this.container?.querySelector('#fuel-density') as HTMLInputElement | null;

      const unit = unitSelect?.value as FuelUnit;
      const value = parseFloat(valueInput?.value ?? '');
      const density = parseFloat(densityInput?.value ?? '0.8');

      if (Number.isNaN(value)) {
        throw new Error('Please enter a valid numeric value.');
      }

      if (Number.isNaN(density) || density <= 0) {
        throw new Error('Please enter a valid density greater than 0.');
      }

      const liters = this.convertToLiters(value, unit, density);
      this.displayResults(liters, density, unit);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to convert fuel. Please check your input.';
      alert(message);
    }
  }

  private convertToLiters(value: number, unit: FuelUnit, density: number): number {
    switch (unit) {
      case 'liters':
        return value;
      case 'kg':
        return value / density;
      case 'gallon':
        return value * this.LITERS_PER_GALLON;
      case 'pound':
        return (value * this.KG_PER_POUND) / density;
      default:
        throw new Error('Unsupported unit selected.');
    }
  }

  private displayResults(liters: number, density: number, inputUnit: FuelUnit): void {
    const litersContainer = this.container?.querySelector('#result-liters')?.closest('.result-value') as HTMLElement | null;
    const kgContainer = this.container?.querySelector('#result-kg')?.closest('.result-value') as HTMLElement | null;
    const gallonContainer = this.container?.querySelector('#result-gallon')?.closest('.result-value') as HTMLElement | null;
    const poundContainer = this.container?.querySelector('#result-pound')?.closest('.result-value') as HTMLElement | null;
    const resultCard = this.container?.querySelector('#fuel-result');

    const kg = liters * density;
    const gallon = liters / this.LITERS_PER_GALLON;
    const pound = kg / this.KG_PER_POUND;

    // Show/hide and update each result based on input unit
    if (litersContainer) {
      litersContainer.style.display = inputUnit === 'liters' ? 'none' : '';
      const valueEl = litersContainer.querySelector('.value');
      if (valueEl) valueEl.textContent = liters.toFixed(2);
    }
    if (kgContainer) {
      kgContainer.style.display = inputUnit === 'kg' ? 'none' : '';
      const valueEl = kgContainer.querySelector('.value');
      if (valueEl) valueEl.textContent = kg.toFixed(2);
    }
    if (gallonContainer) {
      gallonContainer.style.display = inputUnit === 'gallon' ? 'none' : '';
      const valueEl = gallonContainer.querySelector('.value');
      if (valueEl) valueEl.textContent = gallon.toFixed(2);
    }
    if (poundContainer) {
      poundContainer.style.display = inputUnit === 'pound' ? 'none' : '';
      const valueEl = poundContainer.querySelector('.value');
      if (valueEl) valueEl.textContent = pound.toFixed(2);
    }

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

        const nav = navigator as Navigator;
        if (nav.clipboard && nav.clipboard.writeText) {
          nav.clipboard.writeText(text)
            .then(() => this.showCopySuccess(btnElement, originalText))
            .catch(() => this.fallbackCopy(text, btnElement, originalText));
        } else {
          this.fallbackCopy(text, btnElement, originalText);
        }
      };
      (button as HTMLButtonElement).onclick = handler;
    });
  }

  private fallbackCopy(text: string, button: HTMLButtonElement, originalText: string | null): void {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    textarea.setAttribute('readonly', '');
    document.body.appendChild(textarea);

    textarea.select();
    textarea.setSelectionRange(0, 99999);

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
