// File: src/app/businessidea/tabs/financials/persistence.ts

import type { Workbook } from './types';

export const LOCAL_KEY = 'financials:workbook:v1';

export function saveLocal(workbook: Workbook): void {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(workbook));
  } catch (error) {
    console.error('Failed to save workbook to localStorage:', error);
  }
}

export function loadLocal(): Workbook | null {
  try {
    const data = localStorage.getItem(LOCAL_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load workbook from localStorage:', error);
    return null;
  }
}

// Supabase adapters (no-op if client unavailable)
export async function saveSupabase(userId: string, workbook: Workbook): Promise<boolean> {
  try {
    // Dynamically import Supabase client to avoid hard dependency
    const { supabase } = await import('../../../lib/supabase/client');
    
    const { error } = await supabase
      .from('financial_workbooks')
      .upsert({
        user_id: userId,
        workbook_id: workbook.id,
        data: workbook,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,workbook_id'
      });
      
    if (error) {
      console.error('Failed to save workbook to Supabase:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    // Supabase client not available or other error
    console.warn('Supabase not available, skipping save:', error);
    return false;
  }
}

export async function loadSupabase(userId: string, workbookId: string): Promise<Workbook | null> {
  try {
    // Dynamically import Supabase client to avoid hard dependency
    const { supabase } = await import('../../../lib/supabase/client');
    
    const { data, error } = await supabase
      .from('financial_workbooks')
      .select('data')
      .eq('user_id', userId)
      .eq('workbook_id', workbookId)
      .single();
      
    if (error) {
      console.error('Failed to load workbook from Supabase:', error);
      return null;
    }
    
    return data?.data || null;
  } catch (error) {
    // Supabase client not available or other error
    console.warn('Supabase not available, skipping load:', error);
    return null;
  }
}
