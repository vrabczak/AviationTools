import { useEffect, useRef, useState } from 'react';
import { ITool } from './ITool';
import { copyToClipboard } from '../utils/clipboard';

export type FuelUnit = 'liters' | 'kg' | 'gallon' | 'pound';

const LITERS_PER_GALLON = 3.785411784;
const KG_PER_POUND = 0.45359237;

/**
 * Converts a fuel quantity to liters using density where needed.
 *
 * @param value - Input fuel quantity.
 * @param unit - Unit of the provided value.
 * @param density - Fuel density in kg/L.
 * @returns Equivalent value in liters.
 */
export function convertToLiters(value: number, unit: FuelUnit, density: number): number {
  switch (unit) {
    case 'liters':
      return value;
    case 'kg':
      return value / density;
    case 'gallon':
      return value * LITERS_PER_GALLON;
    case 'pound':
      return (value * KG_PER_POUND) / density;
    default:
      throw new Error('Unsupported unit selected.');
  }
}

/**
 * Converts a fuel quantity into all supported units.
 *
 * @param value - Input fuel quantity.
 * @param unit - Unit of the provided value.
 * @param density - Fuel density in kg/L.
 * @returns Object keyed by unit with converted numeric values.
 */
export function convertFuel(value: number, unit: FuelUnit, density: number): Record<FuelUnit, number> {
  const liters = convertToLiters(value, unit, density);
  const kg = liters * density;
  const gallon = liters / LITERS_PER_GALLON;
  const pound = kg / KG_PER_POUND;

  return { liters, kg, gallon, pound };
}

/**
 * UI component for converting fuel between volume and weight using a density factor.
 *
 * @returns Conversion form with copy helpers.
 */
function FuelConversionTool(): JSX.Element {
  const [unit, setUnit] = useState<FuelUnit>('liters');
  const [value, setValue] = useState('');
  const [density, setDensity] = useState('0.8');
  const [results, setResults] = useState<Record<FuelUnit, number> | null>(null);
  const [copiedField, setCopiedField] = useState<FuelUnit | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!results || !resultRef.current) return;
    try {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch {
      resultRef.current.scrollIntoView();
    }
  }, [results]);

  const handleConversion = () => {
    try {
      const numericValue = parseFloat(value);
      const densityValue = parseFloat(density);

      if (Number.isNaN(numericValue)) {
        throw new Error('Please enter a valid numeric value.');
      }

      if (Number.isNaN(densityValue) || densityValue <= 0) {
        throw new Error('Please enter a valid density greater than 0.');
      }

      setResults(convertFuel(numericValue, unit, densityValue));
      setCopiedField(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to convert fuel. Please check your input.';
      alert(message);
    }
  };

  const handleCopy = async (field: FuelUnit) => {
    if (!results) return;
    const valueText = (() => {
      const valueNumber = results[field];
      switch (field) {
        case 'liters':
          return `${valueNumber.toFixed(2)} L`;
        case 'kg':
          return `${valueNumber.toFixed(2)} kg`;
        case 'gallon':
          return `${valueNumber.toFixed(2)} gal`;
        case 'pound':
          return `${valueNumber.toFixed(2)} lb`;
      }
    })();

    const success = await copyToClipboard(valueText);
    if (success) {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    } else {
      alert('Unable to copy to clipboard.');
    }
  };

  const visibleUnits: FuelUnit[] = ['liters', 'kg', 'gallon', 'pound'].filter((u) => u !== unit) as FuelUnit[];

  return (
    <div className="tool-content">
      <h2>Fuel Conversion</h2>
      <p className="tool-description">
        Convert between volume (liters, gallons) and weight (kg, pounds) units for aviation fuel.
        Adjust the density based on fuel type (default 0.8 kg/L for Jet A-1).
      </p>

      <div className="input-group">
        <label htmlFor="fuel-unit">Unit</label>
        <select id="fuel-unit" value={unit} onChange={(e) => setUnit(e.target.value as FuelUnit)}>
          <option value="liters">Liters (L)</option>
          <option value="kg">Kilograms (kg)</option>
          <option value="gallon">US Gallons (gal)</option>
          <option value="pound">Pounds (lb)</option>
        </select>
      </div>

      <div className="input-group">
        <label htmlFor="fuel-value">Value</label>
        <input
          type="number"
          id="fuel-value"
          placeholder="Enter value"
          step="any"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleConversion()}
        />
      </div>

      <div className="input-group">
        <label htmlFor="fuel-density">Density (kg/L)</label>
        <input
          type="number"
          id="fuel-density"
          placeholder="0.8"
          step="0.01"
          value={density}
          onChange={(e) => setDensity(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleConversion()}
        />
        <small>Typical values: Jet A-1 ≈ 0.8, Avgas 100LL ≈ 0.72</small>
      </div>

      <button className="btn-primary" onClick={handleConversion}>Convert</button>

      {results && (
        <div ref={resultRef} className="result">
          <h3>Converted Values</h3>
          <div className="result-grid">
            {visibleUnits.map((targetUnit) => (
              <div key={targetUnit} className="result-value">
                <div className="label">
                  {targetUnit === 'liters' && 'Liters (L)'}
                  {targetUnit === 'kg' && 'Kilograms (kg)'}
                  {targetUnit === 'gallon' && 'US Gallons (gal)'}
                  {targetUnit === 'pound' && 'Pounds (lb)'}
                </div>
                <div className="value" id={`result-${targetUnit}`}>
                  {targetUnit === 'liters' && `${results.liters.toFixed(2)} L`}
                  {targetUnit === 'kg' && `${results.kg.toFixed(2)} kg`}
                  {targetUnit === 'gallon' && `${results.gallon.toFixed(2)} gal`}
                  {targetUnit === 'pound' && `${results.pound.toFixed(2)} lb`}
                </div>
                <button className="btn-secondary copy-btn" onClick={() => handleCopy(targetUnit)}>
                  {copiedField === targetUnit ? 'Copied!' : 'Copy'}
                </button>
              </div>
            ))}
          </div>
          <div className="result-info">
            <p>Conversions are based on the specified fuel density.</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Tool metadata used by the application registry.
 */
export const fuelConversionTool: ITool = {
  id: 'fuel-conversion',
  name: 'Fuel Conversion',
  description: 'Convert between liters, kg, gallons, and pounds using fuel density',
  Component: FuelConversionTool,
};
