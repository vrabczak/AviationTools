import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getById, setInputValue } from '../../../testing/dom-helpers';
import { convertQnhQfe } from './qnh-qfe-conversion.helper';
import { QnhQfeConversionComponent, qnhQfeConversionTool } from './qnh-qfe-conversion.component';

describe('QnhQfeConversion', () => {
  let fixture: ComponentFixture<QnhQfeConversionComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [QnhQfeConversionComponent] }).compileComponents();
    fixture = TestBed.createComponent(QnhQfeConversionComponent);
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  });

  it('round-trips QNH and QFE at airport elevation', () => {
    const qfe = convertQnhQfe(1013.25, 'qnh', 500);
    expect(convertQnhQfe(qfe, 'qfe', 500)).toBeCloseTo(1013.25, 8);
  });

  it('renders QFE in both pressure units', () => {
    setInputValue(getById<HTMLInputElement>(element, 'pressure-value'), '1013.25');
    setInputValue(getById<HTMLInputElement>(element, 'airport-elevation'), '1000');
    fixture.detectChanges();
    (element.querySelector('button.btn-primary') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(getById<HTMLElement>(element, 'result-hpa').textContent?.trim()).toBe('977.2');
    expect(getById<HTMLElement>(element, 'result-inhg').textContent?.trim()).toBe('28.86');
  });

  it('exposes tool metadata', () => {
    expect(qnhQfeConversionTool.id).toBe('qnh-qfe-conversion');
  });
});
