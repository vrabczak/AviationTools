import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getById, setInputValue, setSelectValue } from '../../../testing/dom-helpers';
import { IgeMarginComponent, igeMarginTool } from './ige-margin.component';

describe('IgeMarginComponent', () => {
  let fixture: ComponentFixture<IgeMarginComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IgeMarginComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IgeMarginComponent);
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  });

  it('defaults altitude to feet', () => {
    expect(fixture.componentInstance.altitudeUnitControl.value).toBe('ft');
  });

  it('calculates margin from default feet input', () => {
    setInputValue(getById<HTMLInputElement>(element, 'ige-gross-weight'), '13000');
    setInputValue(getById<HTMLInputElement>(element, 'ige-temperature'), '0');
    setInputValue(getById<HTMLInputElement>(element, 'ige-altitude'), '3280.839895');
    fixture.detectChanges();

    (element.querySelector('button.btn-primary') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(getById<HTMLElement>(element, 'ige-margin-result').textContent?.trim()).toBe('1350 kg');
    expect(getById<HTMLElement>(element, 'ige-limit-result').textContent?.trim()).toBe('14350 kg');
  });

  it('calculates corrected margin when wind inputs are provided', () => {
    setInputValue(getById<HTMLInputElement>(element, 'ige-gross-weight'), '13000');
    setInputValue(getById<HTMLInputElement>(element, 'ige-temperature'), '0');
    setInputValue(getById<HTMLInputElement>(element, 'ige-altitude'), '3280.839895');
    setInputValue(getById<HTMLInputElement>(element, 'ige-wind-velocity'), '11.6631');
    setSelectValue(getById<HTMLSelectElement>(element, 'ige-wind-direction'), 'headwind');
    fixture.detectChanges();

    (element.querySelector('button.btn-primary') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(getById<HTMLElement>(element, 'ige-wind-correction-result').textContent?.trim()).toBe('+461 kg');
    expect(getById<HTMLElement>(element, 'ige-corrected-limit-result').textContent?.trim()).toBe('14811 kg');
    expect(getById<HTMLElement>(element, 'ige-corrected-margin-result').textContent?.trim()).toBe('1811 kg');
  });

  it('exposes metadata', () => {
    expect(igeMarginTool.id).toBe('ige-margin');
    expect(igeMarginTool.name).toBe('IGE Margin');
  });
});
