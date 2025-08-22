import { evaluateFormula } from '../utils/formula';
import { fromA1, toA1, expandRange } from '../utils/address';

// Mock evaluation context
const mockContext = {
  getCellValue: (address: string) => {
    // Mock some cell values for testing
    const mockValues: Record<string, number> = {
      'A1': 10,
      'A2': 20,
      'A3': 30,
      'B1': 5,
      'B2': 15,
      'B3': 25
    };
    return mockValues[address] || 0;
  },
  getRangeValues: (range: string) => {
    // Mock range values for testing
    if (range === 'A1:A3') {
      return [10, 20, 30];
    }
    if (range === 'B1:B3') {
      return [5, 15, 25];
    }
    return [];
  }
};

describe('Formula Evaluation', () => {
  it('should evaluate simple arithmetic expressions', () => {
    expect(evaluateFormula('=10+5', mockContext)).toBe(15);
    expect(evaluateFormula('=10-5', mockContext)).toBe(5);
    expect(evaluateFormula('=10*5', mockContext)).toBe(50);
    expect(evaluateFormula('=10/5', mockContext)).toBe(2);
  });

  it('should evaluate cell references', () => {
    expect(evaluateFormula('=A1', mockContext)).toBe(10);
    expect(evaluateFormula('=A2', mockContext)).toBe(20);
  });

  it('should evaluate ranges with SUM function', () => {
    expect(evaluateFormula('=SUM(A1:A3)', mockContext)).toBe(60);
  });

  it('should evaluate ranges with AVERAGE function', () => {
    expect(evaluateFormula('=AVERAGE(B1:B3)', mockContext)).toBe(15);
  });

  it('should handle complex expressions', () => {
    expect(evaluateFormula('=SUM(A1:A3)+AVERAGE(B1:B3)', mockContext)).toBe(75);
  });
});
