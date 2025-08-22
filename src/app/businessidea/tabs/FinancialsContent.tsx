import React, { useState } from 'react';
import { FinancialsProvider, useFinancials } from './financials/FinancialsContext';
import { FinancialsToolbar } from './financials/FinancialsToolbar';
import { FinancialsGrid } from './financials/FinancialsGrid';
import { Calculator, TrendingUp, PieChart, Edit3 } from 'lucide-react';

// Formula bar component
const FormulaBar: React.FC<{ selectedCell: string | null, cellContent: string }> = ({ selectedCell, cellContent }) => {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border-b border-slate-200">
      <div className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-300 rounded-md min-w-16">
        <Edit3 className="w-3 h-3 text-slate-500" />
        <span className="text-xs font-mono font-medium text-slate-700">
          {selectedCell || 'A1'}
        </span>
      </div>
      <div className="flex-1 px-2 py-1 bg-white border border-slate-300 rounded-md">
        <span className="text-xs font-mono text-slate-600">
          {cellContent || 'Click a cell to edit'}
        </span>
      </div>
    </div>
  );
};

const FinancialsContent: React.FC = () => {
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [cellContent, setCellContent] = useState<string>('');
  return (
    <FinancialsProvider>
      <div className="space-y-3">
        {/* Premium Header Section */}
        <div className="relative bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 rounded-2xl p-4 border border-indigo-100 shadow-sm overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-indigo-100/20"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-200/30 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <Calculator className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Financial Planning</h2>
                <p className="text-xs text-gray-600">Mobile spreadsheet for quick calculations</p>
              </div>
            </div>
            
            {/* Status indicators */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 px-2 py-1 bg-white/70 backdrop-blur-sm rounded-lg border border-white/50">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-xs font-medium text-gray-700">Live</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-white/70 backdrop-blur-sm rounded-lg border border-white/50">
                <PieChart className="w-3 h-3 text-indigo-600" />
                <span className="text-xs font-medium text-gray-700">10×20</span>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Spreadsheet Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden relative">
          {/* Subtle border glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-blue-500/5 rounded-2xl"></div>
          
          <div className="relative">
            <FinancialsToolbar />
            <FormulaBar selectedCell={selectedCell} cellContent={cellContent} />
            <div className="p-3 bg-gradient-to-b from-slate-50/50 to-white">
              <FinancialsGrid height={280} rowHeight={20} density="compact" />
            </div>
            
            {/* Footer with stats */}
            <div className="px-3 py-2 bg-gradient-to-r from-slate-50 to-slate-50/50 border-t border-slate-200/60">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Ready for calculations</span>
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  Connected
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FinancialsProvider>
  );
};

export default FinancialsContent;
