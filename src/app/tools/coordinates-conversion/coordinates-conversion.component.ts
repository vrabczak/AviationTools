import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import * as mgrs from 'mgrs';
import { ToolDefinition } from '../tool-definition';
import { copyToClipboard } from '../../utils/clipboard';

export type CoordinateFormat = 'dd' | 'dm' | 'dms' | 'mgrs';
export interface CoordinatePair { lat: number; lon: number }
export interface CoordinateResultSet {
  dd: string;
  dm: string;
  dms: string;
  mgrs: string;
}

/**
 * UI component for converting coordinates between DD, DM, DMS, and MGRS formats.
 */
@Component({
  selector: 'app-coordinates-conversion',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './coordinates-conversion.component.html',
  styleUrls: ['../tool-shared.css', './coordinates-conversion.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoordinatesConversionComponent {
  readonly formatControl = new FormControl<CoordinateFormat>('dd', { nonNullable: true });
  readonly latInputControl = new FormControl('', { nonNullable: true });
  readonly lonInputControl = new FormControl('', { nonNullable: true });
  readonly mgrsInputControl = new FormControl('', { nonNullable: true });
  readonly results = signal<CoordinateResultSet | null>(null);
  readonly copiedField = signal<keyof CoordinateResultSet | null>(null);

  @ViewChild('resultRef') resultRef?: ElementRef<HTMLDivElement>;

  readonly placeholders: Record<CoordinateFormat, { lat: string; lon: string; helper: string }> = {
    dd: {
      lat: '50.0952147',
      lon: '14.4360100',
      helper: 'Enter latitude and longitude in decimal degrees. North/East positive, South/West negative.',
    },
    dm: {
      lat: "50° 5.712' N",
      lon: "14° 26.160' E",
      helper: 'Enter degrees and decimal minutes with hemisphere (e.g., 50° 5.712\' N).',
    },
    dms: {
      lat: '50° 5\' 42.8" N',
      lon: '14° 26\' 9.6" E',
      helper: 'Enter degrees, minutes, seconds with hemisphere (e.g., 50° 5\' 42.8" N).',
    },
    mgrs: { lat: '', lon: '', helper: '' },
  };

  validateRange(lat: number, lon: number): void {
    if (lat < -90 || lat > 90) {
      throw new Error('Latitude must be between -90 and 90 degrees.');
    }
    if (lon < -180 || lon > 180) {
      throw new Error('Longitude must be between -180 and 180 degrees.');
    }
  }

  getSignFromDirection(direction: string, isLat: boolean, degrees: number): number {
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

  getDirection(value: number, isLat: boolean): 'N' | 'S' | 'E' | 'W' {
    if (isLat) {
      return value >= 0 ? 'N' : 'S';
    }
    return value >= 0 ? 'E' : 'W';
  }

  parseCoordinateString(value: string, expectSeconds: boolean, isLat: boolean): number {
    const trimmed = value.trim().toUpperCase();
    const match = trimmed.match(
      /^(N|S|E|W)?\s*(-?\d+(?:\.\d+)?)\s*(?:[°ůod])?\s*(\d+(?:\.\d+)?)\s*'?\s*(?:(\d+(?:\.\d+)?)\s*"?)?\s*(N|S|E|W)?$/
    );

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

    if (expectSeconds && !direction) {
      const coordLabel = isLat ? 'latitude' : 'longitude';
      throw new Error(`Please include N/S or E/W for the ${coordLabel} DMS value.`);
    }

    const sign = this.getSignFromDirection(direction, isLat, degrees);
    return sign * (Math.abs(degrees) + minutes / 60 + seconds / 3600);
  }

  parseDecimalDegrees(latStr: string, lonStr: string): CoordinatePair {
    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);

    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      throw new Error('Please provide numeric latitude and longitude values.');
    }

    this.validateRange(lat, lon);
    return { lat, lon };
  }

  parseDegreesMinutes(latStr: string, lonStr: string, expectSeconds: boolean): CoordinatePair {
    const lat = this.parseCoordinateString(latStr, expectSeconds, true);
    const lon = this.parseCoordinateString(lonStr, expectSeconds, false);
    this.validateRange(lat, lon);
    return { lat, lon };
  }

  parseMgrs(value: string): CoordinatePair {
    const mgrsValue = value.trim();
    if (!mgrsValue) {
      throw new Error('Please enter an MGRS coordinate.');
    }

    const cleaned = mgrsValue.replace(/\s+/g, '');

    try {
      const [lon, lat] = mgrs.toPoint(cleaned.toUpperCase());
      this.validateRange(lat, lon);
      return { lat, lon };
    } catch {
      throw new Error('Invalid MGRS coordinate. Please check the grid zone and digits.');
    }
  }

  formatDegreesMinutes(value: number, isLat: boolean): string {
    const abs = Math.abs(value);
    const degrees = Math.floor(abs);
    const minutes = (abs - degrees) * 60;
    const direction = this.getDirection(value, isLat);
    return `${degrees}ů${minutes.toFixed(3)}'${direction}`;
  }

  formatDms(value: number, isLat: boolean): string {
    const abs = Math.abs(value);
    const degrees = Math.floor(abs);
    const totalMinutes = (abs - degrees) * 60;
    const minutes = Math.floor(totalMinutes);
    const seconds = (totalMinutes - minutes) * 60;
    const direction = this.getDirection(value, isLat);
    return `${degrees}ů${minutes}'${seconds.toFixed(1)}"${direction}`;
  }

  formatMgrs(mgrsString: string): string {
    const match = mgrsString.match(/^([A-Z\d]+[A-Z])([\d]+)$/);
    if (!match) {
      return mgrsString;
    }

    const [, gridPart, digits] = match;
    const halfLength = digits.length / 2;
    const easting = digits.slice(0, halfLength);
    const northing = digits.slice(halfLength);

    return `${gridPart} ${easting} ${northing}`;
  }

  buildCoordinateResults(pair: CoordinatePair): CoordinateResultSet {
    const dd = `${pair.lat.toFixed(6)}, ${pair.lon.toFixed(6)}`;
    const dm = `${this.formatDegreesMinutes(pair.lat, true)}, ${this.formatDegreesMinutes(pair.lon, false)}`;
    const dms = `${this.formatDms(pair.lat, true)}, ${this.formatDms(pair.lon, false)}`;
    const mgrsRaw = mgrs.forward([pair.lon, pair.lat], 5);
    const mgrsFormatted = this.formatMgrs(mgrsRaw);

    return { dd, dm, dms, mgrs: mgrsFormatted };
  }

  convert(): void {
    try {
      const format = this.formatControl.value;
      let pair: CoordinatePair;
      switch (format) {
        case 'dd':
          pair = this.parseDecimalDegrees(this.latInputControl.value, this.lonInputControl.value);
          break;
        case 'dm':
          pair = this.parseDegreesMinutes(this.latInputControl.value, this.lonInputControl.value, false);
          break;
        case 'dms':
          pair = this.parseDegreesMinutes(this.latInputControl.value, this.lonInputControl.value, true);
          break;
        case 'mgrs':
          pair = this.parseMgrs(this.mgrsInputControl.value);
          break;
        default:
          throw new Error('Unsupported format selected.');
      }
      this.results.set(this.buildCoordinateResults(pair));
      this.copiedField.set(null);
      this.scrollToResult();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to convert coordinates. Please check your input.';
      alert(message);
    }
  }

  async copy(field: keyof CoordinateResultSet): Promise<void> {
    const currentResults = this.results();
    if (!currentResults) return;
    const success = await copyToClipboard(currentResults[field]);
    if (success) {
      this.copiedField.set(field);
      setTimeout(() => {
        this.copiedField.set(null);
      }, 1500);
    } else {
      alert('Unable to copy to clipboard.');
    }
  }

  private scrollToResult(): void {
    const element = this.resultRef?.nativeElement;
    if (!element) return;
    setTimeout(() => {
      try {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch {
        element.scrollIntoView();
      }
    }, 0);
  }
}

/**
 * Tool metadata used by the application registry.
 */
export const coordinatesConversionTool: ToolDefinition = {
  id: 'coordinates-conversion',
  name: 'Coordinates Conversion',
  description: 'Convert between DD, DM, DMS, and 5-digit MGRS coordinates',
  component: CoordinatesConversionComponent,
};
