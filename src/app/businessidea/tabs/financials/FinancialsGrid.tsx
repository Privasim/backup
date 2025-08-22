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
  height = 400,
  rowHeight = 20,
  density = 'compact'
}: FinancialsGridProps) {
  const { sheet, setCellInput, recalc } = useFinancials();
  const [editingCell, setEditingCell] = useState<A1 | null>(null);
  const [editValue, setEditValue] = useState('');
  const [selectedCell, setSelectedCell] = useState<A1 | null>(null);
  const [hoveredCell, setHoveredCell] = useState<A1 | null>(null);
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
    const isHovered = hoveredCell === addr;
    const hasError = cell?.error;
    const hasValue = cell?.value !== null && cell?.value !== undefined;
    const hasFormula = cell?.input?.startsWith('=');
    
    // Header row
    if (row === 1) {
      if (col === 1) {
        return (
          <div 
            className={`flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 font-semibold text-slate-700 ${density === 'compact' ? 'p-1 text-xs' : 'p-1.5 text-sm'}`}
          >
            
          </div>
        );
      }
      
      // Column headers (A, B, C, ...)
      const colLabel = toA1({ row: 1, col });
      const isColumnSelected = selectedCell && fromA1(selectedCell).col === col;
      return (
        <div 
          className={`flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 font-semibold text-indigo-800 ${density === 'compact' ? 'p-0.5 text-xs' : 'p-1 text-sm'} hover:bg-indigo-100 transition-colors cursor-pointer ${
            isColumnSelected ? 'bg-indigo-200 ring-1 ring-indigo-400' : ''
          }`}
          onMouseEnter={() => setHoveredCell(addr)}
          onMouseLeave={() => setHoveredCell(null)}
        >
          {colLabel.substring(0, colLabel.length - 1)}
        </div>
      );
    }
    
    // Header column (1, 2, 3, ...)
    if (col === 1) {
      const isRowSelected = selectedCell && fromA1(selectedCell).row === row;
      return (
        <div 
          className={`flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 font-semibold text-indigo-800 ${density === 'compact' ? 'p-0.5 text-xs' : 'p-1 text-sm'} hover:bg-indigo-100 transition-colors cursor-pointer ${
            isRowSelected ? 'bg-indigo-200 ring-1 ring-indigo-400' : ''
          }`}
          onMouseEnter={() => setHoveredCell(addr)}
          onMouseLeave={() => setHoveredCell(null)}
        >
          {row - 1}
        </div>
      );
    }
    
    // Regular cell editing state
    if (isEditing) {
      return (
        <div className="border-2 border-indigo-500 bg-white shadow-md relative">
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSaveEdit}
            className={`w-full h-full outline-none bg-transparent font-mono ${density === 'compact' ? 'px-1 text-xs' : 'px-1.5 text-sm'}`}
          />
        </div>
      );
    }
    
    // Display cell content with enhanced visual indicators
    let displayValue = '';
    let cellTextColor = 'text-slate-700';
    let cellIcon = null;
    
    if (cell) {
      if (cell.error) {
        displayValue = `#ERROR`;
        cellTextColor = 'text-red-600';
        cellIcon = '⚠️';
      } else if (cell.value !== null) {
        displayValue = String(cell.value);
        cellTextColor = typeof cell.value === 'number' ? 'text-indigo-700 font-medium' : 'text-slate-700';
        if (hasFormula) cellIcon = '🧮';
      } else {
        displayValue = cell.input;
        cellTextColor = 'text-slate-600';
        if (hasFormula) cellIcon = '=';
      }
    }
    
    const cellClasses = `
      border border-slate-200 cursor-pointer transition-all duration-200
      ${density === 'compact' ? 'p-1 text-xs' : 'p-1.5 text-sm'}
      ${isSelected ? 'ring-2 ring-indigo-400 ring-inset shadow-md bg-indigo-50' : ''}
      ${isHovered && !isSelected ? 'bg-indigo-25 border-indigo-300' : ''}
      ${hasError ? 'bg-red-50 border-red-200 shadow-sm' : ''}
      ${hasValue && !hasError && !isSelected ? 'bg-indigo-50/40' : ''}
      ${hasFormula && !hasError && !isSelected ? 'bg-emerald-50/40 border-emerald-200' : ''}
      ${!hasValue && !hasError && !isSelected && !isHovered ? 'bg-white hover:bg-slate-50' : ''}
      ${row % 2 === 0 && col > 1 && !isSelected && !isHovered && !hasError ? 'bg-slate-25' : ''}
      font-mono
      ${cellTextColor}
    `;
    
    return (
      <div 
        className={cellClasses}
        onClick={() => handleCellClick(addr)}
        onMouseEnter={() => setHoveredCell(addr)}
        onMouseLeave={() => setHoveredCell(null)}
        title={hasError ? cell?.error : (hasFormula ? `Formula: ${cell?.input}` : displayValue)}
      >
        <div className="truncate flex items-center gap-1">
          {cellIcon && (
            <span className="text-xs opacity-60 flex-shrink-0">{cellIcon}</span>
          )}
          <span className="flex-1 min-w-0">{displayValue}</span>
        </div>
      </div>
    );
  };
  
  // Calculate grid dimensions
  const visibleRows = Math.min(sheet.rows, Math.floor(height / rowHeight));
  
  return (
    <div className="overflow-auto border border-slate-200 rounded-lg shadow-inner bg-white" style={{ height }}>
      <div 
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${sheet.cols + 1}, minmax(50px, 1fr))`,
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
