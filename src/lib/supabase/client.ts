// File: src/lib/supabase/client.ts
// Minimal no-op Supabase client stub used for builds/environments without Supabase.
// Returns benign results and logs a one-time warning. No network requests are made.

interface SupabaseResult<T = unknown> {
  data: T | null;
  error: null;
}

interface RowQuery {
  upsert(data: unknown, options?: { onConflict?: string }): Promise<SupabaseResult>;
  insert(data: unknown): Promise<SupabaseResult>;
  select(columns?: string): RowQuery;
  eq(column: string, value: unknown): RowQuery;
  single(): Promise<SupabaseResult>;
}

interface SupabaseLike {
  from(table: string): RowQuery;
  rpc(name: string, args?: Record<string, unknown>): Promise<SupabaseResult<unknown[]>>;
}

let warned = false;
function warnOnce(): void {
  if (!warned && typeof console !== 'undefined') {
    warned = true;
    // eslint-disable-next-line no-console
    console.warn('[Supabase Stub] Using stubbed client. No persistence will occur.');
  }
}

function createRowQuery(_table: string): RowQuery {
  return {
    async upsert() {
      warnOnce();
      return { data: null, error: null };
    },
    async insert() {
      warnOnce();
      return { data: null, error: null };
    },
    select() {
      warnOnce();
      return this;
    },
    eq() {
      warnOnce();
      return this;
    },
    async single() {
      warnOnce();
      return { data: null, error: null };
    },
  };
}

export const supabase: SupabaseLike = {
  from(table: string): RowQuery {
    return createRowQuery(table);
  },
  async rpc() {
    warnOnce();
    // Return empty array for data shape expected by callers using RPC
    return { data: [], error: null };
  },
};

export default supabase;
