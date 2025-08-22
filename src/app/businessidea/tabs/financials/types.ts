// File: src/app/businessidea/tabs/financials/types.ts

export interface Workbook {
  id: string;
  name: string;
  activeSheetId: string;
  sheets: Record<string, Sheet>;
  updatedAt: string; // ISO string
  namedRanges?: NamedRange[];
}

export interface Sheet {
  id: string;
  name: string;
  rows: number;
  cols: number;
  cells: Record<A1, Cell>;
  formats?: Record<A1, CellFormat>;
  frozen?: { rows: number; cols: number };
}

export type A1 = string; // e.g., "A1", "AA10"

export interface Cell {
  input: string; // literal or formula e.g., "=SUM(A1:B2)"
  value: number | null;
  error?: string; // evaluation error message
}

export type NumberFormat = 'general' | 'currency' | 'percent' | 'int' | 'decimal';

export interface CellFormat {
  numberFormat?: NumberFormat;
  precision?: number; // decimals for decimal/percent
  bold?: boolean;
  align?: 'left' | 'center' | 'right';
  bg?: 'none' | 'row-zebra' | 'total-row' | 'header';
  color?: string; // CSS color token
}

export interface EvalContext {
  getCellValue: (address: string) => unknown;
  getRangeValues: (range: string) => number[];
}

export interface Selection {
  start: A1;
  end: A1;
}

export interface NamedRange {
  name: string;
  range: string; // e.g., "A1:B10"
}
