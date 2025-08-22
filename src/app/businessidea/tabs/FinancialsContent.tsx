import React from 'react';
import { FinancialsProvider } from './financials/FinancialsContext';
import { FinancialsToolbar } from './financials/FinancialsToolbar';
import { FinancialsGrid } from './financials/FinancialsGrid';
import { Calculator } from 'lucide-react';

const FinancialsContent: React.FC = () => {
  return (
    <FinancialsProvider>
      <div className="space-y-4">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
              <Calculator className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Financial Planning</h2>
              <p className="text-xs text-gray-600">Build and analyze your financial models</p>
            </div>
          </div>
        </div>

        {/* Main Spreadsheet Card */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <FinancialsToolbar />
          <div className="p-4">
            <FinancialsGrid height={500} density="compact" />
          </div>
        </div>
      </div>
    </FinancialsProvider>
  );
};

export default FinancialsContent;
