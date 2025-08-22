import React from 'react';
import { FinancialsProvider } from './financials/FinancialsContext';
import { FinancialsToolbar } from './financials/FinancialsToolbar';
import { FinancialsGrid } from './financials/FinancialsGrid';

const FinancialsContent: React.FC = () => {
  return (
    <FinancialsProvider>
      <div className="flex flex-col h-full bg-white rounded-lg shadow-md">
        <FinancialsToolbar />
        <div className="flex-1 overflow-auto">
          <FinancialsGrid />
        </div>
      </div>
    </FinancialsProvider>
  );
};

export default FinancialsContent;
