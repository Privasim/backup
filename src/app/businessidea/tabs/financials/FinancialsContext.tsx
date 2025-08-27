// File: src/app/businessidea/tabs/financials/FinancialsContext.tsx

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import type { Workbook, Sheet, A1, CellFormat } from './types';
import { evaluateFormula } from './utils/formula';
import { toA1, fromA1, expandRange } from './utils/address';
import { saveLocal, loadLocal } from './persistence';

// Initial workbook state
const createInitialWorkbook = (): Workbook => ({
  id: 'default',
  name: 'Financial Plan',
  activeSheetId: 'sheet1',
  sheets: {
    sheet1: {
      id: 'sheet1',
      name: 'Sheet 1',
      rows: 20,
      cols: 10,
      cells: {},
      formats: {},
      frozen: { rows: 1, cols: 1 }
    }
  },
  updatedAt: new Date().toISOString()
});

// Context type
export interface FinancialsContextValue {
  workbook: Workbook;
  sheet: Sheet;
  setCellInput(addr: A1, input: string): void;
  setFormat(addr: A1, fmt: Partial<CellFormat>): void;
  recalc(): void;
  addSheet(name?: string): void;
  setActiveSheet(id: string): void;
  resize(rows: number, cols: number): void;
  setFrozen(rows: number, cols: number): void;
  undo(): void;
  redo(): void;
  importPlanData(plan: unknown): { rowsAdded: number };
  exportCSV(): string;
  getValue(a1: A1): number | null;
  getRangeValues(range: string): number[];
  getNamedRange(name: string): string | undefined;
  onChange(listener: (wb: Workbook) => void): () => void;
}

// Create context
const FinancialsContext = createContext<FinancialsContextValue | undefined>(undefined);

// Action types
type Action =
  | { type: 'SET_CELL_INPUT'; addr: A1; input: string }
  | { type: 'SET_FORMAT'; addr: A1; fmt: Partial<CellFormat> }
  | { type: 'RECALC' }
  | { type: 'ADD_SHEET'; id: string; name: string }
  | { type: 'SET_ACTIVE_SHEET'; id: string }
  | { type: 'RESIZE'; rows: number; cols: number }
  | { type: 'SET_FROZEN'; rows: number; cols: number }
  | { type: 'IMPORT_PLAN_DATA'; rows: (string | number)[][] }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'INITIALIZE'; workbook: Workbook };

// Reducer
function workbookReducer(state: Workbook, action: Action): Workbook {
  switch (action.type) {
    case 'SET_CELL_INPUT': {
      const sheet = state.sheets[state.activeSheetId];
      if (!sheet) return state;
      
      const newCells = {
        ...sheet.cells,
        [action.addr]: {
          input: action.input,
          value: null, // Will be recalculated
          error: undefined
        }
      };
      
      return {
        ...state,
        sheets: {
          ...state.sheets,
          [state.activeSheetId]: {
            ...sheet,
            cells: newCells
          }
        },
        updatedAt: new Date().toISOString()
      };
    }
    
    case 'SET_FORMAT': {
      const sheet = state.sheets[state.activeSheetId];
      if (!sheet) return state;
      
      const currentFormat = sheet.formats?.[action.addr] || {};
      const newFormats = {
        ...sheet.formats,
        [action.addr]: {
          ...currentFormat,
          ...action.fmt
        }
      };
      
      return {
        ...state,
        sheets: {
          ...state.sheets,
          [state.activeSheetId]: {
            ...sheet,
            formats: newFormats
          }
        },
        updatedAt: new Date().toISOString()
      };
    }
    
    case 'RECALC': {
      const sheet = state.sheets[state.activeSheetId];
      if (!sheet) return state;
      
      const newCells = { ...sheet.cells };
      
      // Create evaluation context
      const ctx = {
        getCellValue: (a1: string): number | null => {
          const cell = newCells[a1];
          if (!cell) return null;
          if (cell.value !== null) return cell.value;
          if (cell.error) return null; // Don't re-evaluate cells with errors
          
          try {
            const value = evaluateFormula(cell.input, ctx);
            newCells[a1] = { ...cell, value };
            return value;
          } catch (error) {
            newCells[a1] = { ...cell, error: (error as Error).message };
            return null;
          }
        },
        getRangeValues: (range: string): number[] => {
          try {
            const cellAddresses = expandRange(range);
            const values: number[] = [];
            for (const addr of cellAddresses) {
              const refCell = newCells[addr];
              if (refCell && typeof refCell.value === 'number') {
                values.push(refCell.value);
              }
            }
            return values;
          } catch (e) {
            console.warn(`Invalid range: ${range}`);
            return [];
          }
        }
      };
      
      // Evaluate all cells with formulas
      Object.entries(newCells).forEach(([addr, cell]) => {
        if (cell.input.startsWith('=')) {
          try {
            const value = evaluateFormula(cell.input, ctx);
            newCells[addr] = { ...cell, value };
          } catch (error) {
            newCells[addr] = { ...cell, error: (error as Error).message };
          }
        } else if (!cell.input.startsWith('=')) {
          // Parse as number for non-formula cells
          const num = parseFloat(cell.input);
          newCells[addr] = { 
            ...cell, 
            value: isNaN(num) ? null : num,
            error: undefined
          };
        }
      });
      
      return {
        ...state,
        sheets: {
          ...state.sheets,
          [state.activeSheetId]: {
            ...sheet,
            cells: newCells
          }
        },
        updatedAt: new Date().toISOString()
      };
    }
    
    case 'ADD_SHEET': {
      const newSheet: Sheet = {
        id: action.id,
        name: action.name,
        rows: 10,
        cols: 20,
        cells: {},
        formats: {}
      };
      
      return {
        ...state,
        sheets: {
          ...state.sheets,
          [action.id]: newSheet
        },
        updatedAt: new Date().toISOString()
      };
    }
    
    case 'SET_ACTIVE_SHEET':
      return {
        ...state,
        activeSheetId: action.id,
        updatedAt: new Date().toISOString()
      };
      
    case 'RESIZE': {
      const sheet = state.sheets[state.activeSheetId];
      if (!sheet) return state;
      
      return {
        ...state,
        sheets: {
          ...state.sheets,
          [state.activeSheetId]: {
            ...sheet,
            rows: action.rows,
            cols: action.cols
          }
        },
        updatedAt: new Date().toISOString()
      };
    }
    
    case 'SET_FROZEN': {
      const sheet = state.sheets[state.activeSheetId];
      if (!sheet) return state;
      
      return {
        ...state,
        sheets: {
          ...state.sheets,
          [state.activeSheetId]: {
            ...sheet,
            frozen: { rows: action.rows, cols: action.cols }
          }
        },
        updatedAt: new Date().toISOString()
      };
    }
    
    case 'IMPORT_PLAN_DATA': {
      const sheet = state.sheets[state.activeSheetId];
      if (!sheet) return state;
      
      // Find the first empty row to start importing
      let startRow = 1;
      while (startRow <= sheet.rows) {
        const addr = toA1({ row: startRow, col: 1 });
        if (!sheet.cells[addr]) break;
        startRow++;
      }
      
      // If we're at the end, expand the sheet
      if (startRow > sheet.rows) {
        return {
          ...state,
          sheets: {
            ...state.sheets,
            [state.activeSheetId]: {
              ...sheet,
              rows: startRow + action.rows.length + 10 // Add some buffer
            }
          }
        };
      }
      
      // Import the data
      const newCells = { ...sheet.cells };
      action.rows.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
          const addr = toA1({ row: startRow + rowIndex, col: colIndex + 1 });
          newCells[addr] = {
            input: String(value),
            value: typeof value === 'number' ? value : null
          };
        });
      });
      
      return {
        ...state,
        sheets: {
          ...state.sheets,
          [state.activeSheetId]: {
            ...sheet,
            cells: newCells
          }
        },
        updatedAt: new Date().toISOString()
      };
    }
    
    case 'INITIALIZE':
      return action.workbook;
      
    // Undo/Redo would require a more complex state management with history
    // For now, we'll just ignore these actions
    case 'UNDO':
    case 'REDO':
      return state;
      
    default:
      return state;
  }
}

// Hook
export function useFinancials(): FinancialsContextValue {
  const context = useContext(FinancialsContext);
  if (!context) {
    throw new Error('useFinancials must be used within a FinancialsProvider');
  }
  return context;
}

// Provider
export function FinancialsProvider({ children }: { children: React.ReactNode }) {
  const [workbook, dispatch] = useReducer(workbookReducer, createInitialWorkbook());
  const listenersRef = useRef<((wb: Workbook) => void)[]>([]);
  
  // Load workbook from localStorage on mount
  useEffect(() => {
    const savedWorkbook = loadLocal();
    if (savedWorkbook) {
      dispatch({ type: 'INITIALIZE', workbook: savedWorkbook });
    }
  }, []);
  
  // Save workbook to localStorage on change
  useEffect(() => {
    saveLocal(workbook);
    
    // Notify listeners
    listenersRef.current.forEach(listener => listener(workbook));
  }, [workbook]);
  
  // Get active sheet
  const sheet = workbook.sheets[workbook.activeSheetId] || Object.values(workbook.sheets)[0];
  
  // API methods
  const setCellInput = useCallback((addr: A1, input: string) => {
    dispatch({ type: 'SET_CELL_INPUT', addr, input });
  }, []);
  
  const setFormat = useCallback((addr: A1, fmt: Partial<CellFormat>) => {
    dispatch({ type: 'SET_FORMAT', addr, fmt });
  }, []);
  
  const recalc = useCallback(() => {
    dispatch({ type: 'RECALC' });
  }, []);
  
  const addSheet = useCallback((name?: string) => {
    const id = `sheet${Object.keys(workbook.sheets).length + 1}`;
    dispatch({ type: 'ADD_SHEET', id, name: name || `Sheet ${Object.keys(workbook.sheets).length + 1}` });
  }, [workbook.sheets]);
  
  const setActiveSheet = useCallback((id: string) => {
    dispatch({ type: 'SET_ACTIVE_SHEET', id });
  }, []);
  
  const resize = useCallback((rows: number, cols: number) => {
    dispatch({ type: 'RESIZE', rows, cols });
  }, []);
  
  const setFrozen = useCallback((rows: number, cols: number) => {
    dispatch({ type: 'SET_FROZEN', rows, cols });
  }, []);
  
  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);
  
  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);
  
  const importPlanData = useCallback((plan: unknown) => {
    // This is a simplified implementation
    // In a real implementation, we would use the list-plan-adapter
    const rows: (string | number)[][] = [
      ['Task', 'Effort', 'Phase', 'Cost'],
      ['Imported from plan', 0, 'N/A', 0]
    ];
    
    dispatch({ type: 'IMPORT_PLAN_DATA', rows });
    
    return { rowsAdded: rows.length };
  }, []);
  
  const exportCSV = useCallback(() => {
    if (!sheet) return '';
    
    const lines: string[] = [];
    
    for (let r = 1; r <= sheet.rows; r++) {
      const row: string[] = [];
      for (let c = 1; c <= sheet.cols; c++) {
        const addr = toA1({ row: r, col: c });
        const cell = sheet.cells[addr];
        row.push(cell ? cell.input : '');
      }
      lines.push(row.join(','));
    }
    
    return lines.join('\n');
  }, [sheet]);
  
  const getValue = useCallback((a1: A1): number | null => {
    if (!sheet) return null;
    const cell = sheet.cells[a1];
    return cell ? cell.value : null;
  }, [sheet]);
  
  const getRangeValues = useCallback((range: string): number[] => {
    if (!sheet) return [];
    
    try {
      // This is a simplified implementation
      // In a real implementation, we would use the address utilities
      const parts = range.split(':');
      if (parts.length !== 2) return [];
      
      const start = fromA1(parts[0]);
      const end = fromA1(parts[1]);
      
      const values: number[] = [];
      for (let r = start.row; r <= end.row; r++) {
        for (let c = start.col; c <= end.col; c++) {
          const addr = toA1({ row: r, col: c });
          const cell = sheet.cells[addr];
          if (cell && cell.value !== null) {
            values.push(cell.value);
          }
        }
      }
      
      return values;
    } catch (error) {
      console.error('Error getting range values:', error);
      return [];
    }
  }, [sheet]);

  const evaluateCell = useCallback((sheetId: string, a1: A1): number | null => {
    const sheet = workbook.sheets[sheetId];
    if (!sheet) return null;
    
    const cell = sheet.cells[a1];
    if (!cell || !cell.input.startsWith('=')) return null;
    
    const evalContext = {
      getCellValue: (address: string) => {
        try {
          const refCell = sheet.cells[address];
          return refCell ? refCell.value : null;
        } catch (e) {
          console.warn(`Invalid cell reference: ${address}`);
          return null;
        }
      },
      getRangeValues: (range: string) => {
        try {
          const cells = expandRange(range);
          const values: number[] = [];
          for (const cellAddr of cells) {
            const refCell = sheet.cells[cellAddr];
            if (refCell && typeof refCell.value === 'number') {
              values.push(refCell.value);
            }
          }
          return values;
        } catch (e) {
          console.warn(`Invalid range: ${range}`);
          return [];
        }
      }
    };
    
    try {
      return evaluateFormula(cell.input, evalContext);
    } catch (e) {
      console.error(`Error evaluating formula in ${a1}:`, e);
      return null;
    }
  }, [workbook]);

  const getNamedRange = useCallback((name: string): string | undefined => {
    if (!workbook.namedRanges) return undefined;
    const range = workbook.namedRanges.find(r => r.name === name);
    return range ? range.range : undefined;
  }, [workbook.namedRanges]);

  
  const onChange = useCallback((listener: (wb: Workbook) => void) => {
    listenersRef.current.push(listener);
    
    // Return unsubscribe function
    return () => {
      listenersRef.current = listenersRef.current.filter(l => l !== listener);
    };
  }, []);
  
  // Recalculate on mount and when sheet changes
  useEffect(() => {
    recalc();
  }, [recalc]);
  
  const contextValue: FinancialsContextValue = {
    workbook,
    sheet: sheet || createInitialWorkbook().sheets.sheet1,
    setCellInput,
    setFormat,
    recalc,
    addSheet,
    setActiveSheet,
    resize,
    setFrozen,
    undo,
    redo,
    importPlanData,
    exportCSV,
    getValue,
    getRangeValues,
    getNamedRange,
    onChange
  };
  
  return (
    <FinancialsContext.Provider value={contextValue}>
      {children}
    </FinancialsContext.Provider>
  );
}
