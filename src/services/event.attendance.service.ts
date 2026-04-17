import { XpLevelUpInfo, EventAttendanceSheet, EventFilters } from '@/types/types';
import { BaseService } from './base.service';
import { Attendance, AttendanceInsert, AttendanceUpdate } from './index';
import { xPLevelUpService } from './xp.levelup.service';

// eslint-disable-next-line import/prefer-default-export
export class EventAttendanceService extends BaseService {
  // Register a user for a club event
  async registerUserForClubEvent(eventId: number): Promise<Attendance> {
    try {
      const userId = await this.getCurrentUserId();

      // Get event details to get club_id
      const { data: event, error: eventError } = await this.supabase
        .from('events')
        .select('club_id, event_name')
        .eq('id', eventId)
        .single();

      if (eventError || !event) {
        throw new Error('Event not found');
      }

      // Check if user is already registered
      const { data: existing, error: checkError } = await this.supabase
        .from('event_attendance')
        .select('id, status')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        if (existing.status === 'registered') {
          throw new Error('User already registered for this event');
        } else if (existing.status === 'checked_in') {
          throw new Error('User already checked into this event');
        }
      }

      // Register the user
      const attendanceRecord: AttendanceInsert = {
        club_id: event.club_id,
        event_id: eventId,
        user_id: userId,
        status: 'registered',
        registered_at: new Date().toISOString(),
        xp_given: 0, // XP will be given when checking in
        bonus_xp: 0,
      };

      const { data, error } = await this.supabase
        .from('event_attendance')
        .insert(attendanceRecord)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to register for event');

      return data;
    } catch (error) {
      this.handleError(error, 'registerUserForClubEvent');
      throw error;
    }
  }

  // Check in for an event
  async checkInEvent(eventId: number): Promise<{
    attendance: Attendance;
    xpAwarded: XpLevelUpInfo;
  }> {
    try {
      let attendanceFn;
      const userId = await this.getCurrentUserId();

      // Get event details
      const { data: event, error: eventError } = await this.supabase
        .from('events')
        .select('club_id, base_xp, bonus_xp, event_date')
        .eq('id', eventId)
        .single();

      if (eventError || !event) {
        throw new Error('Event not found');
      }

      // Check if event has already passed
      const eventDate = new Date(event.event_date);
      const now = new Date();
      if (eventDate < now) {
        throw new Error('Cannot check in to past events');
      }

      // Find the attendance record if it exists
      const { data: attendance, error: attendanceError } = await this.supabase
        .from('event_attendance')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();

      if (attendance && attendance.status === 'checked_in') {
        throw new Error('User already checked in for this event');
      }

      // Update attendance record
      const updateData: AttendanceUpdate = {
        status: 'checked_in',
        checked_in_at: new Date().toISOString(),
        xp_given: event.base_xp || 10,
        bonus_xp: event.bonus_xp || 0,
      };

      // create attendance file if not there already
      if (attendanceError) {
        const attendanceMake = await this.registerUserForClubEvent(eventId);
        const { data: updateAttend, error: updateErr } = await this.supabase
          .from('event_attendance')
          .update(updateData)
          .eq('id', attendanceMake.id)
          .select()
          .single();
        if (updateErr) throw updateErr;
        if (!updateAttend) throw new Error('Failed to update attendance');
        attendanceFn = attendanceMake; // final return val
      } else {
        // Update attendance record if it already exists
        const { data, error } = await this.supabase
          .from('event_attendance')
          .update(updateData)
          .eq('id', attendance.id)
          .select()
          .single();

        if (error) throw error;
        if (!data) throw new Error('Failed to update attendance');
        attendanceFn = data;
      }

      // Calculate total XP to give
      const totalXp = (event.base_xp || 10) + (event.bonus_xp || 0);

      // Award XP through the XP service before updating attendance
      const xpResult = await xPLevelUpService.awardXP(userId, totalXp);

      return {
        attendance: attendanceFn,
        xpAwarded: xpResult,
      };
    } catch (error) {
      this.handleError(error, 'eventAttendanceService.updateAttendanceForEvent');
      throw error;
    }
  }

  // Get all registrations for an event (for club reps/admins)
  async getEventRegistrations(eventId: number): Promise<Attendance[]> {
    try {
      const userId = await this.getCurrentUserId();

      // Get event to check if user is club rep/admin
      const { data: event, error: eventError } = await this.supabase
        .from('events')
        .select('club_id')
        .eq('id', eventId)
        .single();

      if (eventError || !event) {
        throw new Error('Event not found');
      }

      // Check if user is a club rep or admin for this club
      const { data: membership, error: membershipError } = await this.supabase
        .from('club_memberships')
        .select('role')
        .eq('user_id', userId)
        .eq('club_id', event.club_id)
        .single();

      if (
        membershipError ||
        !membership ||
        (membership.role !== 'club_rep' && membership.role !== 'admin')
      ) {
        throw new Error('Only club representatives can view event registrations');
      }

      // Get all registrations
      const { data, error } = await this.supabase
        .from('event_attendance')
        .select(
          `
          *,
          users:user_id (
            first_name,
            last_name,
            email,
            avatar_url
          )
        `,
        )
        .eq('event_id', eventId)
        .order('registered_at', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      this.handleError(error, 'getEventRegistrations');
      throw error;
    }
  }

  // Check if a user is registered for an event
  async isUserRegistered(eventId: number): Promise<boolean> {
    try {
      const userId = await this.getCurrentUserId();

      const { data, error } = await this.supabase
        .from('event_attendance')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      return !!data;
    } catch (error) {
      this.handleError(error, 'isUserRegistered');
      return false;
    }
  }

  async getAllMyEvents(filters?: EventFilters): Promise<EventAttendanceSheet[]> {
    try {
      const userId = await this.getCurrentUserId();
      const now = new Date().toISOString();

      // Build query
      let query = this.supabase
        .from('event_attendance')
        .select(
          `
        *,
        events:event_id (
          *,
          clubs:club_id (
            id,
            club_name,
            logo_url
          )
        )
      `,
        )
        .eq('user_id', userId);

      // Apply filters
      if (filters?.clubId) {
        query = query.eq('club_id', filters.clubId);
      }

      if (filters?.upcoming) {
        query = query.gte('events.event_date', now);
      }

      if (filters?.past) {
        query = query.lt('events.event_date', now);
      }

      const { data, error } = await query.order('event_date', {
        ascending: !filters?.past, // Past: newest first, Upcoming: soonest first
        referencedTable: 'events',
      });

      if (error) throw error;

      if (!data || data.length === 0) {
        return [];
      }

      return data.map((record) => ({
        attendance: {
          id: record.id,
          club_id: record.club_id,
          event_id: record.event_id,
          user_id: record.user_id,
          status: record.status,
          registered_at: record.registered_at,
          checked_in_at: record.checked_in_at,
          xp_given: record.xp_given,
          bonus_xp: record.bonus_xp,
          created_at: record.created_at,
        },
        event: record.events,
        club: {
          id: record.events.clubs.id,
          club_name: record.events.clubs.club_name,
          logo_url: record.events.clubs.logo_url,
        },
      }));
    } catch (error) {
      this.handleError(error, 'getAllMyEvents');
      throw error;
    }
  }
}

export const eventAttendanceService = new EventAttendanceService();
