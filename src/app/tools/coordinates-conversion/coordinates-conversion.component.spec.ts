import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getById, setInputValue, setSelectValue } from '../../../testing/dom-helpers';
import { CoordinatesConversionComponent, coordinatesConversionTool } from './coordinates-conversion.component';

describe('CoordinatesConversion', () => {
  let component: CoordinatesConversionComponent;
  let fixture: ComponentFixture<CoordinatesConversionComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoordinatesConversionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CoordinatesConversionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  });
  describe('Parsing', () => {
    it('parses decimal degrees', () => {
      const result = component.parseDecimalDegrees('48.85837', '2.29448');
      expect(result.lat).toBeCloseTo(48.85837, 5);
      expect(result.lon).toBeCloseTo(2.29448, 5);
    });

    it('throws on out of range values', () => {
      expect(() => component.validateRange(95, 0)).toThrowError(/Latitude/);
      expect(() => component.validateRange(0, 190)).toThrowError(/Longitude/);
    });

    it('parses DM format', () => {
      const result = component.parseDegreesMinutes("48° 51.502 N", "2° 17.669 E", false);
      expect(result.lat).toBeCloseTo(48.85837, 4);
      expect(result.lon).toBeCloseTo(2.29448, 4);
    });

    it('parses DMS format', () => {
      const result = component.parseDegreesMinutes(`50° 5' 42.8" N`, `14° 26' 9.6" E`, true);
      expect(result.lat).toBeCloseTo(50.09522, 4);
      expect(result.lon).toBeCloseTo(14.436, 3);
    });

    it('parses coordinate string with prefix direction', () => {
      const lat = component.parseCoordinateString('N 48 51.502', false, true);
      expect(lat).toBeCloseTo(48.85837, 4);
    });

    it('throws on invalid DM string', () => {
      expect(() => component.parseCoordinateString('invalid', false, true)).toThrowError(/Could not parse DM/);
    });

    it('parses MGRS', () => {
      const result = component.parseMgrs('33UXQ0123456789');
      expect(result.lat).toBeDefined();
      expect(result.lon).toBeDefined();
    });
  });

  describe('Formatting', () => {
    it('formats DM and DMS strings', () => {
      expect(component.formatDegreesMinutes(48.85837, true)).toContain('N');
      expect(component.formatDms(2.29448, false)).toContain('E');
    });

    it('formats MGRS grouping', () => {
      expect(component.formatMgrs('33UXQ0123456789')).toBe('33UXQ 01234 56789');
    });
  });

  describe('Conversions', () => {
    it('builds all coordinate outputs', () => {
      const results = component.buildCoordinateResults({ lat: 48.85837, lon: 2.29448 });
      expect(results.dd).toContain('48.858370');
      expect(results.dm).toContain('N');
      expect(results.dms).toContain('"');
      expect(results.mgrs.length).toBeGreaterThan(10);
    });
  });

  describe('Metadata', () => {
    it('exposes correct metadata', () => {
      expect(coordinatesConversionTool.id).toBe('coordinates-conversion');
      expect(coordinatesConversionTool.name).toBeTruthy();
    });
  });

  it('renders converted coordinates for decimal degrees input', () => {
    setSelectValue(getById<HTMLSelectElement>(element, 'coordinate-format'), 'dd');
    setInputValue(getById<HTMLInputElement>(element, 'lat-input'), '50.0952147');
    setInputValue(getById<HTMLInputElement>(element, 'lon-input'), '14.4360100');
    fixture.detectChanges();

    const button = element.querySelector('button.btn-primary') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    const ddText = getById<HTMLElement>(element, 'result-dd').textContent ?? '';
    expect(ddText).toContain('50.095215');
    expect(ddText).toContain('14.436010');

    const dmsText = getById<HTMLElement>(element, 'result-dms').textContent ?? '';
    expect(dmsText).toContain('N');
    expect(dmsText).toContain('E');
  });
});
