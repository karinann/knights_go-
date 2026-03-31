// Abstract class for forming services
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types'

export abstract class BaseService {
  protected static supabase: SupabaseClient<Database> = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  protected supabase: SupabaseClient<Database>

  constructor() {
    this.supabase = BaseService.supabase

  }

  protected handleError(error: any, context: string) {
    console.error(`Error in ${context}:`, error)
    throw new Error(`${context}: ${error.message}`)
  }

  // Gets the current authed user's db ID and returns it (from users table)
  // throws error if user not found
  protected async getCurrentUserId(): Promise<number> {
    const {
        data: {user: userSession}  , error: userSessError,
      } = await this.supabase.auth.getUser();
      if (!userSession) throw new Error('Unauthorized');

      if (!userSession || userSessError ) {
        throw new Error('Unauthorized: Must be logged in');
      }

      // Get user profile
      const { data: dbUser, error: userError } = await this.supabase
        .from('users')
        .select('id')
        .eq('user_id', userSession.id)
        .single();

      // Failed to get user
      if (!dbUser|| userError) {
        throw new Error('User profile not found');
      }

      return dbUser.id
  }
}
