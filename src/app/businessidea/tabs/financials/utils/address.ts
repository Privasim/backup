// File: src/app/businessidea/tabs/financials/utils/address.ts

export function colToLetters(col: number): string {
  if (col < 1) throw new Error('Column must be >= 1');
  let result = '';
  let c = col;
  while (c > 0) {
    const remainder = (c - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    c = Math.floor((c - 1) / 26);
  }
  return result;
}

export function lettersToCol(letters: string): number {
  if (!/^[A-Z]+$/.test(letters)) throw new Error('Invalid column letters');
  let result = 0;
  for (let i = 0; i < letters.length; i++) {
    result = result * 26 + (letters.charCodeAt(i) - 64);
  }
  return result;
}

export function toA1(pos: { row: number; col: number }): string {
  if (pos.row < 1 || pos.col < 1) throw new Error('Row and column must be >= 1');
  return colToLetters(pos.col) + pos.row;
}

export function fromA1(a1: string): { row: number; col: number } {
  const match = a1.match(/^([A-Z]+)(\d+)$/);
  if (!match) throw new Error('Invalid A1 notation');
  const [, letters, rowStr] = match;
  return { row: parseInt(rowStr, 10), col: lettersToCol(letters) };
}

export function expandRange(range: string): string[] {
  const parts = range.split(':');
  if (parts.length !== 2) throw new Error('Invalid range format');
  
  const start = fromA1(parts[0]);
  const end = fromA1(parts[1]);
  
  const result: string[] = [];
  for (let r = start.row; r <= end.row; r++) {
    for (let c = start.col; c <= end.col; c++) {
      result.push(toA1({ row: r, col: c }));
    }
  }
  return result;
}
