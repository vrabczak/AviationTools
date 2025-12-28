import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getById, setInputValue, setSelectValue } from '../../../testing/dom-helpers';
import { ApproachTableComponent, approachTableTool } from './approach-table.component';

describe('ApproachTable', () => {
  let fixture: ComponentFixture<ApproachTableComponent>;
  let component: ApproachTableComponent;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApproachTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ApproachTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  });

  it('builds 10 rows for NM distances', () => {
    const rows = component.calculateApproachTable(1500, 3, 'NM');
    expect(rows.length).toBe(10);
    expect(rows[0].distanceNM).toBe(1);
  });

  it('builds 20 rows for kilometer distances', () => {
    const rows = component.calculateApproachTable(1500, 3, 'km');
    expect(rows.length).toBe(20);
    expect(rows[0].distanceKM).toBe('1');
  });

  it('renders the approach table for NM inputs', () => {
    setInputValue(getById<HTMLInputElement>(element, 'target-altitude'), '500');
    setInputValue(getById<HTMLInputElement>(element, 'slope-angle'), '3');
    setSelectValue(getById<HTMLSelectElement>(element, 'distance-unit'), 'NM');
    fixture.detectChanges();

    const button = element.querySelector('button.btn-primary') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    const rows = element.querySelectorAll('tbody tr');
    expect(rows.length).toBe(10);

    const firstRowCells = rows[0].querySelectorAll('td');
    expect(firstRowCells[0].textContent?.trim()).toBe('1');
    expect(firstRowCells[1].textContent?.trim()).toBe('818');
  });

  it('exposes metadata', () => {
    expect(approachTableTool.id).toBe('approach-table');
    expect(approachTableTool.name).toBeTruthy();
  });
});
