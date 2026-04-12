import { BaseService } from './base.service';
import type { Event, EventInsert } from './index';

// eslint-disable-next-line import/prefer-default-export
export class EventService extends BaseService {
  // Insert a new club event
  async insertClubEvent(eventData: EventInsert): Promise<Event> {
    try {
      // Verify the user is a member of this club
      const userId = await this.getCurrentUserId();

      const { data: membership, error: membershipError } = await this.supabase
        .from('club_memberships')
        .select('role')
        .eq('user_id', userId)
        .eq('club_id', eventData.club_id)
        .single();

      if (membershipError || !membership) {
        throw new Error('You must be a club member to create events');
      }

      // Prepare event data
      const newEvent: EventInsert = {
        ...eventData,
        status: 'active',
      };

      // Insert the event
      const { data, error } = await this.supabase.from('events').insert(newEvent).select().single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create event');

      return data;
    } catch (error) {
      this.handleError(error, 'insertClubEvent');
      throw error;
    }
  }

  async updateClubEvent(eventData: EventInsert): Promise<Event> {
    try {
      // Verify the user is a member of this club
      const userId = await this.getCurrentUserId();

      const { data: membership, error: membershipError } = await this.supabase
        .from('club_memberships')
        .select('role')
        .eq('user_id', userId)
        .eq('club_id', eventData.club_id)
        .single();

      if (
        membershipError ||
        !membership ||
        membership.role !== 'club_rep' ||
        membership.role !== 'admin'
      ) {
        throw new Error('You must be a club rep to create events');
      }

      // Prepare event data
      const newEvent: EventInsert = {
        ...eventData,
        status: 'active',
      };

      // Insert the event
      const { data, error } = await this.supabase.from('events').insert(newEvent).select().single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create event');

      return data;
    } catch (error) {
      this.handleError(error, 'insertClubEvent');
      throw error;
    }
  }

  // Get all upcoming events for clubs the user is a member of
  async getAllUpcomingClubEvents(): Promise<Event[]> {
    try {
      const userId = await this.getCurrentUserId();

      // Get all clubs the user is a member of
      const { data: memberships, error: membershipError } = await this.supabase
        .from('club_memberships')
        .select('club_id')
        .eq('user_id', userId);

      if (membershipError) throw membershipError;

      if (!memberships || memberships.length === 0) {
        return [];
      }

      const clubIds = memberships.map((m) => m.club_id);

      // Get upcoming events for those clubs
      const { data, error } = await this.supabase
        .from('events')
        .select('*')
        .in('club_id', clubIds)
        .eq('status', 'active')
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      this.handleError(error, 'getAllUpcomingClubEvents');
      throw error;
    }
  }

  // Get events for a specific club
  async getClubEvents(clubId: number, includePast?: false): Promise<Event[]> {
    try {
      let query = this.supabase
        .from('events')
        .select('*')
        .eq('club_id', clubId)
        .eq('status', 'active');

      if (!includePast) {
        query = query.gte('event_date', new Date().toISOString());
      }

      const { data, error } = await query.order('event_date', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      this.handleError(error, 'getClubEvents');
      throw error;
    }
  }

  // Get a single event by ID
  async getEventById(eventId: number): Promise<Event | null> {
    try {
      const { data, error } = await this.supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      this.handleError(error, 'getEventById');
      throw error;
    }
  }
}

export const eventService = new EventService();
