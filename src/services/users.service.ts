import type { MonDressUpUrls, RoleWithClub } from '@/types/types';
import type { User, UserUpdate } from './index';
import { BaseService } from './base.service';

export class UserService extends BaseService {
  // Get all users
  async getUsers(limit = 10, offset = 0): Promise<User[]> {
    try {
      const query = this.supabase
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
    } catch (error) {
      this.handleError(error, 'UserService.getUserById');
      return null;
    }
  }

  // Edit user
  async updateUser(id: number, data: UserUpdate): Promise<User> {
    try {
      const currentUserID = await this.getCurrentUserId();

      if (currentUserID !== id) {
        throw new Error('You can only dress your own Mon!');
      }

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
    } catch (error) {
      this.handleError(error, 'UserService.updateUser');
      throw new Error('Failed to update User');
    }
  }

  // Delete User
  async deleteUser(id: number): Promise<void> {
    try {
      const currentUserID = await this.getCurrentUserId();
      if (currentUserID !== id) {
        throw new Error('You can only delete your own account');
      }

      const { error: deleteError } = await this.supabase.from('users').delete().eq('id', id);

      if (deleteError) throw deleteError;
    } catch (error) {
      this.handleError(error, 'UserService.deleteUser');
    }
  }

  // Get clubs that the user is in; returns the user's role and club name, desc,
  // category, and logo_url
  async getMyClubs(userId: number, limit: 10, offset: 0): Promise<RoleWithClub[]> {
    try {
      const currentUserID = await this.getCurrentUserId();

      if (currentUserID !== userId) {
        throw new Error('You can only get your own clubs!');
      }

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
        `,
        )
        .eq('user_id', userId);

      if (membershipError) throw membershipError;

      // If user isn't in any clubs, return empty array
      if (!memberships) {
        return [];
      }

      const res: RoleWithClub[] = memberships.map((item) => ({
        club: item.clubs,
        role: item.role || 'member',
      }));

      return res;
    } catch (err) {
      this.handleError(err, 'UserService.getMyClubs');
      return [];
    }
  }

  // Update profile picture (avatar_url)
  async updateProfilePicture(userId: number, pfpUrl: string): Promise<User> {
    try {
      const currentUserID = await this.getCurrentUserId();

      if (currentUserID !== userId) {
        throw new Error('You can only dress your own Mon!');
      }

      const { data, error } = await this.supabase
        .from('users')
        .update({ avatar_url: pfpUrl })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      this.handleError(error, 'userService.updateProfilePicture');
      throw error;
    }
  }

  // Update Base Mon
  async updateMonBaseUrl(userId: number, monUrl: string): Promise<User> {
    try {
      const currentUserID = await this.getCurrentUserId();

      if (currentUserID !== userId) {
        throw new Error('You can only dress your own Mon!');
      }

      const { data, error } = await this.supabase
        .from('users')
        .update({ mon_url: monUrl })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      this.handleError(error, 'updateMonBaseUrl');
      throw error;
    }
  }

  // Update hat for mon
  async updateMonHatUrl(userId: number, hatUrl: string): Promise<User> {
    try {
      const currentUserID = await this.getCurrentUserId();

      if (currentUserID !== userId) {
        throw new Error('You can only dress your own Mon!');
      }

      const { data, error } = await this.supabase
        .from('users')
        .update({ mon_hat_url: hatUrl })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      this.handleError(error, 'updateMonHatUrl');
      throw error;
    }
  }

  // Update shirt of mon
  async updateMonShirtUrl(userId: number, shirtUrl: string): Promise<User> {
    try {
      const currentUserID = await this.getCurrentUserId();

      if (currentUserID !== userId) {
        throw new Error('You can only dress your own Mon!');
      }

      const { data, error } = await this.supabase
        .from('users')
        .update({ mon_shirt_url: shirtUrl })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      this.handleError(error, 'updateMonShirtUrl');
      throw error;
    }
  }

  // Update wand of mon
  async updateMonWandUrl(userId: number, wandUrl: string): Promise<User> {
    try {
      const currentUserID = await this.getCurrentUserId();

      if (currentUserID !== userId) {
        throw new Error('You can only dress your own Mon!');
      }

      const { data, error } = await this.supabase
        .from('users')
        .update({ mon_wand_url: wandUrl })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      this.handleError(error, 'updateMonWandUrl');
      throw error;
    }
  }

  // Get all MON URLs for a user
  async getMonUrls(userId: number): Promise<MonDressUpUrls> {
    try {
      const currentUserID = await this.getCurrentUserId();

      if (currentUserID !== userId) {
        throw new Error('You can only dress your own Mon!');
      }

      const { data, error } = await this.supabase
        .from('users')
        .select('mon_url, mon_hat_url, mon_shirt_url, mon_wand_url')
        .eq('id', userId)
        .single();

      if (error) throw error;

      const monDressUp: MonDressUpUrls = {
        mon_url: data.mon_url || null,
        mon_hat_url: data.mon_hat_url || null,
        mon_shirt_url: data.mon_shirt_url || null,
        mon_wand_url: data.mon_wand_url || null,
      };

      return monDressUp;
    } catch (error) {
      this.handleError(error, 'getMonUrls');
      throw error;
    }
  }
}

// Export singleton instance for reusing across calls
export const userService = new UserService();
