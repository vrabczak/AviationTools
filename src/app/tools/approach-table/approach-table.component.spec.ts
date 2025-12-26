import { ApproachTableComponent, approachTableTool } from './approach-table.component';

describe('ApproachTable', () => {
  it('builds 10 rows for NM distances', () => {
    const component = new ApproachTableComponent();
    const rows = component.calculateApproachTable(1500, 3, 'NM');
    expect(rows.length).toBe(10);
    expect(rows[0].distanceNM).toBe(1);
  });

  it('builds 20 rows for kilometer distances', () => {
    const component = new ApproachTableComponent();
    const rows = component.calculateApproachTable(1500, 3, 'km');
    expect(rows.length).toBe(20);
    expect(rows[0].distanceKM).toBe('1');
  });

  it('exposes metadata', () => {
    expect(approachTableTool.id).toBe('approach-table');
    expect(approachTableTool.name).toBeTruthy();
  });
});
