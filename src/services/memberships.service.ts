import { BaseService } from './base.service';
import type { Member, MemberInsert, MemberUpdate } from '../types/database.types';
import type { ClubMember } from '../types/types';

// Membeship class: join/leave/update/getcount
export class MembershipsService extends BaseService {
  // Join club (params: data: user_id, club_id, role)
  async joinClub(data: MemberInsert): Promise<Member> {
    try {

      if (!data.club_id || !data.user_id) {
        throw new Error('Missing club_id or user_id; both are required');
      }
      const input = { ...data, role: data.role || 'member', joined_at: new Date().toISOString() };

      const { data: memberData, error: memberError } = await this.supabase
        .from('club_memberships')
        .insert(input)
        .select()
        .single();
      if (memberError) throw memberError;

      return memberData;
    } catch (err: any) {
      this.handleError(err, 'MembershipService.joinClub');
      throw new Error('Failed to join club');
    }
  }

  // Leave a club: params: (clubid, userid). Returns true if successful,
  // false, if not
  async leaveClub(clubId: number, userId: number): Promise<boolean> {
    try {
      // const currentUserID = await this.getCurrentUserId();

      // if (currentUserID !== userId) throw new Error('You are not authorized to leave the club')

      const { error: err } = await this.supabase
        .from('club_memberships')
        .delete()
        .eq('club_id', clubId)
        .eq('user_id', userId);

      if (err) throw err;
      return true;
    } catch (err: any) {
      this.handleError(err, 'MembershipService.leaveClub');
      return false;
    }
  }

  // Checks if a user is a member: true if so, false if not
  async isMember(clubId: number, userId: number): Promise<boolean> {
    try {

      const { data, error } = await this.supabase
        .from('club_memberships')
        .select('membership_id')
        .eq('club_id', clubId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data !== null;
    } catch (err) {
      this.handleError(err, 'MembershipService.isMember');
      throw new Error('Failed to check if user isMember');
    }
  }

  // Update Member's role: Returns Member info on success, throws error if not
  // only admins can update roles
  async updateMemberRole(clubId: number, userId: number, role: string): Promise<Member> {
    try {
      // const currentUserID = await this.getCurrentUserId();

      // // check if current user is the user making the request
      // const { data: currUser, error: userError } = await this.supabase
      //   .from('users')
      //   .select('id')
      //   .eq('id', currentUserID)
      //   .single();

      // if (!currUser) throw new Error('User not found for updating role!');

      // Check if the user is an admin (only admins can update roles)
      const { data: roleCheck, error: roleError } = await this.supabase
        .from('club_memberships')
        .select('role')
        .eq('club_id', clubId)
        .eq('user_id', userId)
        .single();

      if (roleError || !roleCheck) throw new Error("You're not a member of this club!");
      if (roleCheck.role !== 'admin') throw new Error('Only admins can update roles!');

      const { data: newData, error: updateError } = await this.supabase
        .from('club_memberships')
        .update({ role })
        .eq('user_id', userId)
        .eq('club_id', clubId)
        .select()
        .single();

      if (updateError) throw updateError;
      return newData;
    } catch (err: any) {
      this.handleError(err, 'MembershipService.updateMemberRole');
      throw new Error('Failed to update member');
    }
  }

  // Counts number of members in a club; returns number of members, or null if failed
  async getMemberCount(clubId: number): Promise<number | null> {
    try {
      const { count, error } = await this.supabase
        .from('club_memberships')
        .select('*', { count: 'exact', head: true })
        .eq('club_id', clubId);

      if (error) throw error;

      return count;
    } catch (err: any) {
      this.handleError(err, 'MembershipService.getMemberCount');
      return null;
    }
  }
}

export const membershipsService = new MembershipsService()
