import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getById, setInputValue, setSelectValue } from '../../../testing/dom-helpers';
import { OgeMarginComponent, ogeMarginTool } from './oge-margin.component';

describe('OgeMarginComponent', () => {
  let fixture: ComponentFixture<OgeMarginComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OgeMarginComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OgeMarginComponent);
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  });

  it('calculates margin from metric inputs', () => {
    setInputValue(getById<HTMLInputElement>(element, 'oge-gross-weight'), '13000');
    setInputValue(getById<HTMLInputElement>(element, 'oge-temperature'), '0');
    setInputValue(getById<HTMLInputElement>(element, 'oge-altitude'), '1000');
    setSelectValue(getById<HTMLSelectElement>(element, 'oge-altitude-unit'), 'm');
    fixture.detectChanges();

    (element.querySelector('button.btn-primary') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(getById<HTMLElement>(element, 'oge-margin-result').textContent?.trim()).toBe('211 kg');
    expect(getById<HTMLElement>(element, 'oge-limit-result').textContent?.trim()).toBe('13211 kg');
  });

  it('calculates corrected margin when wind inputs are provided', () => {
    setInputValue(getById<HTMLInputElement>(element, 'oge-gross-weight'), '13000');
    setInputValue(getById<HTMLInputElement>(element, 'oge-temperature'), '0');
    setInputValue(getById<HTMLInputElement>(element, 'oge-altitude'), '1000');
    setSelectValue(getById<HTMLSelectElement>(element, 'oge-altitude-unit'), 'm');
    setInputValue(getById<HTMLInputElement>(element, 'oge-wind-velocity'), '11.6631');
    setSelectValue(getById<HTMLSelectElement>(element, 'oge-wind-direction'), 'headwind');
    fixture.detectChanges();

    (element.querySelector('button.btn-primary') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(getById<HTMLElement>(element, 'oge-wind-correction-result').textContent?.trim()).toBe('+574 kg');
    expect(getById<HTMLElement>(element, 'oge-corrected-limit-result').textContent?.trim()).toBe('13785 kg');
    expect(getById<HTMLElement>(element, 'oge-corrected-margin-result').textContent?.trim()).toBe('785 kg');
  });

  it('exposes metadata', () => {
    expect(ogeMarginTool.id).toBe('oge-margin');
    expect(ogeMarginTool.name).toBe('OGE Margin');
  });
});
