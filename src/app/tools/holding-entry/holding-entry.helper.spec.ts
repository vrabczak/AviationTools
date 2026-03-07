import { determineHoldingEntryProcedure, normalizeCourse } from './holding-entry.helper';

describe('holding-entry helper', () => {
  it('normalizes courses to 0-359', () => {
    expect(normalizeCourse(360)).toBe(0);
    expect(normalizeCourse(-10)).toBe(350);
  });

  it('classifies right-turn entries', () => {
    expect(determineHoldingEntryProcedure(360, 'right', 150)).toBe('Teardrop');
    expect(determineHoldingEntryProcedure(360, 'right', 240)).toBe('Parallel');
    expect(determineHoldingEntryProcedure(360, 'right', 20)).toBe('Direct');
  });

  it('classifies left-turn entries', () => {
    expect(determineHoldingEntryProcedure(360, 'left', 210)).toBe('Teardrop');
    expect(determineHoldingEntryProcedure(360, 'left', 120)).toBe('Parallel');
    expect(determineHoldingEntryProcedure(360, 'left', 330)).toBe('Direct');
  });
});
