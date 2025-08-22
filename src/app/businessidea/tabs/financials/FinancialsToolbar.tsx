// File: src/app/businessidea/tabs/financials/FinancialsToolbar.tsx

import React from 'react';
import { useFinancials } from './FinancialsContext';
import { getFinancialsSystemPrompt } from './ai/financials-tooling';
import { 
  Plus, 
  RefreshCw, 
  Download, 
  Lock, 
  Bot
} from 'lucide-react';

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
    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100 p-2">
      <div className="flex items-center justify-between">
        {/* Left side - Primary actions */}
        <div className="flex items-center gap-0.5">
          {/* Sheet Management Group */}
          <div className="flex items-center gap-0.5 mr-2">
            <button 
              onClick={handleAddSheet}
              className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700 transition-colors duration-200 shadow-sm"
              title="Add new sheet"
            >
              <Plus size={12} />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>

          {/* Calculation Group */}
          <div className="flex items-center gap-0.5 mr-2">
            <button 
              onClick={recalc}
              className="inline-flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 transition-colors duration-200 shadow-sm"
              title="Recalculate all formulas"
            >
              <RefreshCw size={12} />
              <span className="hidden sm:inline">Calc</span>
            </button>
          </div>

          {/* Utilities Group */}
          <div className="flex items-center gap-0.5">
            <button 
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm"
              title="Export as CSV file"
            >
              <Download size={12} />
              <span className="hidden md:inline">CSV</span>
            </button>
            
            <button 
              onClick={handleFreezeHeaders}
              className="inline-flex items-center gap-1 px-2 py-1 bg-slate-600 text-white text-xs font-medium rounded-md hover:bg-slate-700 transition-colors duration-200 shadow-sm"
              title="Freeze headers for scrolling"
            >
              <Lock size={12} />
              <span className="hidden lg:inline">Lock</span>
            </button>
          </div>
        </div>
        
        {/* Right side - AI assist and sheet info */}
        <div className="flex items-center gap-1">
          <button 
            onClick={handleAIAssist}
            className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-medium rounded-md hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-sm"
            title="Get AI assistance for financial modeling"
          >
            <Bot size={12} />
            <span className="hidden sm:inline">AI</span>
          </button>
          
          <div className="hidden md:flex items-center gap-1 px-2 py-1 bg-white/60 backdrop-blur-sm rounded-md border border-indigo-200">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
            <span className="text-xs font-medium text-indigo-900 truncate max-w-16">
              {workbook.sheets[workbook.activeSheetId]?.name || 'Sheet 1'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
