// Abstract class for forming services
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

export abstract class BaseService {
  protected static supabase: SupabaseClient<Database> = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  protected supabase: SupabaseClient<Database>;

  constructor() {
    this.supabase = BaseService.supabase;
  }

  protected handleError(error: any, context: string) {
    console.error(`Error in ${context}:`, error);
    throw new Error(`${context}: ${error.message}`);
  }
}
