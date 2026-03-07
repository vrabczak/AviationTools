import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HoldingEntryComponent, holdingEntryTool } from './holding-entry.component';

describe('HoldingEntryComponent', () => {
  let fixture: ComponentFixture<HoldingEntryComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HoldingEntryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HoldingEntryComponent);
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  });

  it('determines an entry procedure and renders a result', () => {
    const inboundInput = element.querySelector('#hold-inbound-course') as HTMLInputElement;
    const entryInput = element.querySelector('#entry-course') as HTMLInputElement;
    const direction = element.querySelector('#pattern-direction') as HTMLSelectElement;
    const button = element.querySelector('button.btn-primary') as HTMLButtonElement;

    inboundInput.value = '360';
    inboundInput.dispatchEvent(new Event('input'));

    entryInput.value = '240';
    entryInput.dispatchEvent(new Event('input'));

    direction.value = 'right';
    direction.dispatchEvent(new Event('change'));

    fixture.detectChanges();
    button.click();
    fixture.detectChanges();

    const result = element.querySelector('#entry-procedure-name');
    expect(result?.textContent?.trim()).toBe('Parallel');
    expect(element.querySelector('svg.entry-diagram')).toBeTruthy();
  });

  it('exposes tool metadata', () => {
    expect(holdingEntryTool.id).toBe('holding-entry');
    expect(holdingEntryTool.name).toContain('Holding');
  });
});
