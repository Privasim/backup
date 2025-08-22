// File: src/app/businessidea/tabs/financials/FinancialsToolbar.tsx

import React from 'react';
import { useFinancials } from './FinancialsContext';
import { getFinancialsSystemPrompt } from './ai/financials-tooling';

export function FinancialsToolbar() {
  const { 
    addSheet, 
    recalc, 
    exportCSV, 
    setFrozen,
    workbook
  } = useFinancials();
  
  const handleAddSheet = () => {
    const name = prompt('Enter sheet name:');
    if (name) {
      addSheet(name);
    }
  };
  
  const handleExportCSV = () => {
    const csv = exportCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workbook.name || 'financials'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleFreezeHeaders = () => {
    setFrozen(1, 1);
  };
  
  const handleAIAssist = () => {
    // In a real implementation, this would integrate with the chatbox
    // For now, we'll just show the system prompt
    alert('AI Assist would use this system prompt:\n\n' + getFinancialsSystemPrompt());
  };
  
  return (
    <div className="flex flex-wrap gap-2 p-2 bg-gray-100 border-b border-gray-300">
      <button 
        onClick={handleAddSheet}
        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Add Sheet
      </button>
      
      <button 
        onClick={recalc}
        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Recalculate
      </button>
      
      <button 
        onClick={handleExportCSV}
        className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
      >
        Export CSV
      </button>
      
      <button 
        onClick={handleFreezeHeaders}
        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
      >
        Freeze Headers
      </button>
      
      <button 
        onClick={handleAIAssist}
        className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600"
      >
        AI Assist
      </button>
      
      <div className="ml-auto flex items-center">
        <span className="text-sm text-gray-600">
          {workbook.sheets[workbook.activeSheetId]?.name || 'Sheet 1'}
        </span>
      </div>
    </div>
  );
}
