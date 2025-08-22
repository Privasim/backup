// File: src/app/businessidea/tabs/financials/FinancialsGrid.tsx

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useFinancials } from './FinancialsContext';
import { toA1, fromA1 } from './utils/address';
import type { A1, Cell } from './types';

export interface FinancialsGridProps {
  height?: number; // px
  rowHeight?: number; // px
  density?: 'compact' | 'comfortable';
}

export function FinancialsGrid({
  height = 600,
  rowHeight = 24,
  density = 'compact'
}: FinancialsGridProps) {
  const { sheet, setCellInput, recalc } = useFinancials();
  const [editingCell, setEditingCell] = useState<A1 | null>(null);
  const [editValue, setEditValue] = useState('');
  const [selectedCell, setSelectedCell] = useState<A1 | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Focus the input when editing starts
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);
  
  const handleCellClick = (addr: A1) => {
    setSelectedCell(addr);
    
    // If clicking the same cell, start editing
    if (addr === editingCell) return;
    
    // If already editing, save the current edit
    if (editingCell) {
      handleSaveEdit();
    }
    
    setEditingCell(addr);
    const cell = sheet.cells[addr];
    setEditValue(cell ? cell.input : '');
  };
  
  const handleSaveEdit = () => {
    if (!editingCell) return;
    
    setCellInput(editingCell, editValue);
    setEditingCell(null);
    setEditValue('');
    
    // Recalculate after a short delay to allow state to update
    setTimeout(() => recalc(), 0);
  };
  
  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!editingCell) return;
    
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        handleSaveEdit();
        // Move selection down
        if (selectedCell) {
          const pos = fromA1(selectedCell);
          const nextAddr = toA1({ row: pos.row + 1, col: pos.col });
          handleCellClick(nextAddr);
        }
        break;
      case 'Escape':
        e.preventDefault();
        handleCancelEdit();
        break;
      case 'Tab':
        e.preventDefault();
        handleSaveEdit();
        // Move selection right
        if (selectedCell) {
          const pos = fromA1(selectedCell);
          const nextAddr = toA1({ row: pos.row, col: pos.col + 1 });
          handleCellClick(nextAddr);
        }
        break;
    }
  };
  
  const renderCell = (row: number, col: number) => {
    const addr = toA1({ row, col });
    const cell = sheet.cells[addr];
    const isEditing = editingCell === addr;
    const isSelected = selectedCell === addr;
    
    // Header row
    if (row === 1) {
      if (col === 1) {
        return (
          <div 
            className={`flex items-center justify-center border border-gray-300 bg-gray-100 font-bold ${density === 'compact' ? 'p-1' : 'p-2'}`}
          >
            
          </div>
        );
      }
      
      // Column headers (A, B, C, ...)
      const colLabel = toA1({ row: 1, col });
      return (
        <div 
          className={`flex items-center justify-center border border-gray-300 bg-gray-100 font-bold ${density === 'compact' ? 'p-1' : 'p-2'}`}
        >
          {colLabel.substring(0, colLabel.length - 1)}
        </div>
      );
    }
    
    // Header column (1, 2, 3, ...)
    if (col === 1) {
      return (
        <div 
          className={`flex items-center justify-center border border-gray-300 bg-gray-100 font-bold ${density === 'compact' ? 'p-1' : 'p-2'}`}
        >
          {row - 1}
        </div>
      );
    }
    
    // Regular cell
    if (isEditing) {
      return (
        <div className="border border-blue-500 relative">
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSaveEdit}
            className="w-full h-full px-1 outline-none"
          />
        </div>
      );
    }
    
    // Display cell content
    let displayValue = '';
    if (cell) {
      if (cell.error) {
        displayValue = `#ERROR: ${cell.error}`;
      } else if (cell.value !== null) {
        displayValue = String(cell.value);
      } else {
        displayValue = cell.input;
      }
    }
    
    const cellClasses = `
      border border-gray-300 
      ${density === 'compact' ? 'p-1' : 'p-2'}
      ${isSelected ? 'ring-2 ring-blue-500' : ''}
      ${row % 2 === 0 && col > 1 ? 'bg-gray-50' : 'bg-white'}
    `;
    
    return (
      <div 
        className={cellClasses}
        onClick={() => handleCellClick(addr)}
      >
        {displayValue}
      </div>
    );
  };
  
  // Calculate grid dimensions
  const visibleRows = Math.min(sheet.rows, Math.floor(height / rowHeight));
  
  return (
    <div className="overflow-auto border border-gray-300" style={{ height }}>
      <div 
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${sheet.cols + 1}, minmax(80px, 1fr))`,
          gridTemplateRows: `repeat(${visibleRows + 1}, ${rowHeight}px)`
        }}
      >
        {Array.from({ length: visibleRows + 1 }, (_, rowIndex) => (
          Array.from({ length: sheet.cols + 1 }, (_, colIndex) => (
            <React.Fragment key={`${rowIndex}-${colIndex}`}>
              {renderCell(rowIndex + 1, colIndex + 1)}
            </React.Fragment>
          ))
        ))}
      </div>
    </div>
  );
}
