import { BaseService } from './base.service';
import type { User, UserUpdate } from '../types/database.types';
import type { RoleWithClub } from '@/types/types';


export class UserService extends BaseService {

  // Get all users
  async getUsers(limit = 10, offset = 0): Promise<User[]> {
    try {
      let query = this.supabase
        .from('users')
        .select('*')
        .range(offset, offset + limit - 1)
        .order('first_name', { ascending: true });
      const { data, error } = await query;

      if (error) throw error; // 5. Check for Supabase errors
      return data || []; // 6. Return data or empty array
    } catch (error) {
      this.handleError(error, 'UserService.getUsers'); // 7. Use base class error handling
      return []; // return nothing
    }
  }

  // Get one user by their id
  async getUserById(id: number): Promise<User | null> {
    try {
      // Select clubs by id - get one club
      const { data, error } = await this.supabase.from('users').select('*').eq('id', id).single();

      if (error) throw error;

      // On sucess, return data; null if not
      return data;
    } catch (error: any) {
      this.handleError(error, 'UserService.getUserById');
      return null;
    }
  }

  // Edit user
  async updateUser(id: number, data: UserUpdate): Promise<User> {
    try {

      // // Ensure users can update only their profile
      // const currentUserID = await this.getCurrentUserId();

      // // Get user profile for checking if user has permissions
      // const { data: user, error: userError } = await this.supabase
      //   .from('users')
      //   .select('id')
      //   .eq('id', currentUserID)
      //   .single();

      // if (userError || !user) {
      //   throw new Error('User profile not found');
      // }

      // if (user.id !== id) {
      //   throw new Error('You can only update your own profile');
      // }

      // Update user info
      const { data: updatedUser, error: userUpdateError } = await this.supabase
        .from('users')
        .update({
          ...data,
        })
        .eq('id', id)
        .select()
        .single();

      if (userUpdateError) throw userUpdateError;
      return updatedUser;
    } catch (error: any) {
      this.handleError(error, 'UserService.updateUser');
      throw new Error('Failed to update User');
    }
  }

  // Delete User
  async deleteUser(id: number): Promise<void> {
    try {
      // // Confirm user
      // const currentUserID = await this.getCurrentUserId();

      // // Get user profile
      // const { data: user, error: userError } = await this.supabase
      //   .from('users')
      //   .select('id')
      //   .eq('id', currentUserID)
      //   .single()

      // // Failed to get user
      // if (userError || !user) {
      //   throw new Error('User profile not found');
      // }

      const { error: deleteError } = await this.supabase.from('users').delete().eq('id', id);

      if (deleteError) throw deleteError;
    } catch (error: any) {
      this.handleError(error, 'UserService.deleteUser');
    }
  }

  // Get clubs that the user is in; returns the user's role and club name, desc,
  // category, and logo_url
  async getMyClubs(userId: number, limit: 10, offset: 0): Promise<RoleWithClub[]> {
    try {
      // const currentUserID = await this.getCurrentUserId()

      // // Get user profile
      // const { data: user, error: userError } = await this.supabase
      //   .from('users')
      //   .select('id')
      //   .eq('id', currentUserID)
      //   .single();

      // // Failed to get user
      // if (userError || !user) {
      //   throw new Error('User profile not found');
      // }

      // if (user.id != userId) {
      //   throw new Error('You are not the actual user!')
      // }


      const { data: memberships, error: membershipError } = await this.supabase
        .from('club_memberships')
        .select(
          `role,
            clubs:club_id (
            id,
            club_name,
            description,
            category,
            logo_url
          )
        `)
        .eq('user_id', userId);

      if (membershipError) throw membershipError;

      // If user isn't in any clubs, return empty array
      if (!memberships) {
        return [];
      }

      const res: RoleWithClub[] = memberships.map((item) => ({
        club: item.clubs,
        role: item.role || "member"
      }));

      return res;
    } catch (err: any) {
      return [];
    }
  }
}

// Export singleton instance for reusing across calls
export const userService = new UserService();
