import { BaseService } from './base.service';
import type { Club, ClubInsert, ClubUpdate } from './index';
import type { SearchClubsParams } from '../types/types';

export class ClubService extends BaseService {
  async getClubs(limit = 10, offset = 0): Promise<Club[]> {
    try {
      const query = this.supabase
        .from('clubs')
        .select('*')
        .range(offset, offset + limit - 1)
        .order('club_name', { ascending: true });
      const { data, error } = await query;

      if (error) throw error; // 5. Check for Supabase errors
      return data || []; // 6. Return data or empty array
    } catch (error) {
      this.handleError(error, 'ClubService.getClubs'); // 7. Use base class error handling
      return []; // return nothing
    }
  }

  // Get all clubs by param (category, name). Limits to 10 per
  async getAllClubsByParam(params?: SearchClubsParams): Promise<Club[]> {
    try {
      let query = this.supabase.from('clubs').select('*');

      // Search by category
      if (params?.category) {
        query = query.eq('category', params.category);
      }

      // Search by club name
      if (params?.club_name) {
        query = query.ilike('club_name', `%${params.club_name}%`);
      }

      // Apply pagination
      const limit = params?.limit || 10;
      const offset = params?.offset || 0;
      query = query.range(offset, offset + limit - 1);

      // Order by club name, in ascending order
      query = query.order('club_name', { ascending: true });

      const { data, error } = await query;

      if (error) throw error;

      // On sucess, return data; error if not
      return data || [];
    } catch (error) {
      this.handleError(error, 'ClubService.getAllClubsByParams');
      return [];
    }
  }

  // Get one club by its id
  async getClubById(id: number): Promise<Club | null> {
    try {
      // Select clubs by id - get one club
      const { data, error } = await this.supabase.from('clubs').select('*').eq('id', id).single();

      if (error) throw error;

      // On sucess, return data; null if not
      return data;
    } catch (error) {
      this.handleError(error, 'ClubService.getClubById');
      return null;
    }
  }

  // Create a club
  async createClub(data: ClubInsert): Promise<Club> {
    try {
      // Get current user
      const currentUserID = await this.getCurrentUserId();

      // Get user info
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('id')
        .eq('id', currentUserID)
        .single();

      // if user not found, throuw error
      if (userError) throw new Error('User not found');

      // Create club
      const { data: club, error } = await this.supabase
        .from('clubs')
        .insert({
          ...data,
          created_by: user.id,
          experience_level: 1,
          experience_points: 0,
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-add creator as member
      const { error: membershipError } = await this.supabase.from('club_memberships').insert({
        user_id: user.id,
        club_id: club.id,
        role: 'admin',
      });

      // Delete the newly made club if membership failed to apply
      if (membershipError) {
        await this.supabase.from('clubs').delete().eq('id', club.id);
      }
      return club;
    } catch (err) {
      this.handleError(err, 'ClubService.CreateClub');
      throw new Error('Failed to create club');
    }
  }

  // Edit club
  async updateClub(clubId: number, data: ClubUpdate): Promise<Club> {
    try {
      const currentUserID = await this.getCurrentUserId();

      // Check membership join table for user's role
      const { data: membership, error: membershipError } = await this.supabase
        .from('club_memberships')
        .select('role')
        .eq('user_id', currentUserID)
        .eq('club_id', clubId)
        .maybeSingle();

      if (membershipError) throw membershipError;

      // if the user is either a club_rep or admin, they can edit the club
      if (!membership || (membership.role !== 'club_rep' && membership.role !== 'admin')) {
        throw new Error('You do not have permission to edit this club');
      }

      // Update club info
      const { data: updatedClub, error: clubUpdateError } = await this.supabase
        .from('clubs')
        .update({
          ...data,
        })
        .eq('id', clubId)
        .select()
        .single();

      if (clubUpdateError) throw clubUpdateError;
      return updatedClub;
    } catch (error) {
      this.handleError(error, 'ClubService.updateClub');
      throw new Error('Failed to update club');
    }
  }

  // Update club mon picture (avatar_url)
  async updateClubSprite(userId: number, clubId: number, spriteUrl: string): Promise<Club> {
    try {
      const currentUserID = await this.getCurrentUserId();

      if (currentUserID !== userId) {
        throw new Error('Only club admins can edit club sprite!!');
      }

      // Check membership join table for user's role
      const { data: membership, error: membershipError } = await this.supabase
        .from('club_memberships')
        .select('role')
        .eq('user_id', currentUserID)
        .eq('club_id', clubId)
        .maybeSingle();

      if (membershipError) throw membershipError;

      // if the user is either a club_rep or admin, they can edit the club
      if (!membership || membership.role !== 'admin') {
        throw new Error('Only admins can edit the club logo!');
      }

      // Update club's sprite
      const { data, error } = await this.supabase
        .from('clubs')
        .update({ sprite_url: spriteUrl })
        .eq('id', clubId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      this.handleError(error, 'clubService.updateClubSprite');
      throw error;
    }
  }

  // Update club mon picture (avatar_url)
  async updateClubLogo(userId: number, clubId: number, logoUrl: string): Promise<Club> {
    try {
      const currentUserID = await this.getCurrentUserId();

      if (currentUserID !== userId) {
        throw new Error('Only club admins can edit club sprite!!');
      }

      // Check membership join table for user's role
      const { data: membership, error: membershipError } = await this.supabase
        .from('club_memberships')
        .select('role')
        .eq('user_id', currentUserID)
        .eq('club_id', clubId)
        .maybeSingle();

      if (membershipError) throw membershipError;

      // if the user is either a club_rep or admin, they can edit the club
      if (!membership || membership.role !== 'admin') {
        throw new Error('Only admins can edit the club logo!');
      }

      // Update club's sprite
      const { data, error } = await this.supabase
        .from('clubs')
        .update({ logo_url: logoUrl })
        .eq('id', clubId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      this.handleError(error, 'clubService.updateClubSprite');
      throw error;
    }
  }

  // Delete club; only admins can do so
  async deleteClub(clubId: number): Promise<void> {
    try {
      // const currentClubID = await this.getCurrentUserId();

      // // Get user profile for checking if user has permissions
      // const { data: user, error: userError } = await this.supabase
      //   .from('users')
      //   .select('id, user_type')
      //   .eq('id', currentClubID)
      //   .single();

      // // Failed to get user
      // if (userError || !user) {
      //   throw new Error('User profile not found for deleting club');
      // }

      // // Get club info
      // const { data: existingClub, error: clubError } = await this.supabase
      //   .from('clubs')
      //   .select('created_by')
      //   .eq('id', clubId)
      //   .single();

      // if (clubError) throw clubError;

      // // Check if user has permission to update this club (admin)
      // if (
      //   existingClub != null &&
      //   existingClub.created_by !== user.id &&
      //   user.user_type !== 'admin'
      // ) {
      //   throw new Error('You do not have permission to delete this club');
      // }

      const { error: deleteError } = await this.supabase.from('clubs').delete().eq('id', clubId);

      if (deleteError) throw deleteError;

      // console.log('Club deleted successfully');
    } catch (error) {
      this.handleError(error, 'ClubService.deleteClub');
    }
  }

  // Get members of club
  // async getClubMembers(clubId: number, limit = 10, offset = 0): Promise<ClubMember[]> {
  //   try {
  //     const { data, error } = await this.supabase
  //       .from('club_memberships')
  //       .select(
  //         `
  //         *,
  //         users:user_id (
  //           id,
  //           first_name,
  //           last_name,
  //           avatar_url
  //         )
  //       `,
  //       )
  //       .eq('club_id', clubId)
  //       .range(offset, offset + limit - 1);

  //     if (error) throw error;

  //     return data;
  //   } catch (error: any) {
  //     this.handleError(error, 'ClubService.getClubMembers');
  //     return [];
  //   }
  // }
}

// Export singleton instance for reusing across calls
export const clubService = new ClubService();
