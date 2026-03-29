import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types'

export abstract class BaseService {
  protected supabase: SupabaseClient<Database>

  constructor() {
    this.supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  protected handleError(error: any, context: string) {
    console.error(`Error in ${context}:`, error)
    throw new Error(`${context}: ${error.message}`)
  }
}
