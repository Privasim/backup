// File: src/app/businessidea/tabs/financials/bridge.ts

// Simple singleton bridge for cross-tab imports
export type Importer = (data: unknown) => { rowsAdded: number };

let registeredImporter: Importer | null = null;

export const FinancialsBridge = {
  register(importer: Importer): void {
    registeredImporter = importer;
  },
  
  importFromPlan(data: unknown): { rowsAdded: number } {
    if (!registeredImporter) {
      console.warn('No financials importer registered');
      return { rowsAdded: 0 };
    }
    
    try {
      return registeredImporter(data);
    } catch (error) {
      console.error('Error importing plan data to financials:', error);
      return { rowsAdded: 0 };
    }
  }
};
