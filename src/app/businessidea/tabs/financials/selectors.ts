// File: src/app/businessidea/tabs/financials/selectors.ts

import { useFinancials } from './FinancialsContext';
import type { A1 } from './types';

export interface FinancialsSelectors {
  getValue(a1: A1): number | null;
  getRangeValues(range: string): number[];
}

export function useFinancialsSelectors(): FinancialsSelectors {
  const { getValue, getRangeValues } = useFinancials();
  
  return {
    getValue,
    getRangeValues
  };
}
