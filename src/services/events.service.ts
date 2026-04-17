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
        (membership.role !== 'club_rep' && membership.role !== 'admin')
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

  // Update event's latitude and longitude
  async updateEventLatLong(eventId: number, latitude: number, longitude: number): Promise<Event> {
    try {
      const userId = await this.getCurrentUserId();

      // Get the event details first to check club ownership
      const { data: event, error: eventError } = await this.supabase
        .from('events')
        .select('club_id, event_name, status')
        .eq('id', eventId)
        .single();

      if (eventError || !event) {
        throw new Error('Event not found');
      }

      // Check if event is cancelled or completed
      if (event.status === 'cancelled') {
        throw new Error('Cannot update location for a cancelled event');
      }

      if (event.status === 'completed') {
        throw new Error('Cannot update location for a completed event');
      }

      // Check user's role for this club
      const { data: membership, error: membershipError } = await this.supabase
        .from('club_memberships')
        .select('role')
        .eq('user_id', userId)
        .eq('club_id', event.club_id)
        .single();

      if (membershipError || !membership) {
        throw new Error('You are not a member of this club');
      }

      // Check if user is admin or club rep
      const isAdmin = membership.role === 'admin';
      const isClubRep = membership.role === 'club_rep';

      if (!isAdmin && !isClubRep) {
        throw new Error('Only club representatives or admins can update event locations');
      }

      // Validate coordinates
      if (latitude < -90 || latitude > 90) {
        throw new Error('Latitude must be between -90 and 90');
      }

      if (longitude < -180 || longitude > 180) {
        throw new Error('Longitude must be between -180 and 180');
      }

      // Update the event location
      const { data, error } = await this.supabase
        .from('events')
        .update({
          latitude,
          longitude,
        })
        .eq('id', eventId)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update event location');

      return data;
    } catch (error) {
      this.handleError(error, 'eventService.updateEventLocation');
      throw error;
    }
  }

  // Update the event's string location
  async updateEventLocation(eventId: number, location: string): Promise<Event> {
    try {
      const userId = await this.getCurrentUserId();

      // Get the event details first to check club ownership
      const { data: event, error: eventError } = await this.supabase
        .from('events')
        .select('club_id, event_name, status')
        .eq('id', eventId)
        .single();

      if (eventError || !event) {
        throw new Error('Event not found');
      }

      // Check if event is cancelled or completed
      if (event.status === 'cancelled') {
        throw new Error('Cannot update location for a cancelled event');
      }

      if (event.status === 'completed') {
        throw new Error('Cannot update location for a completed event');
      }

      // Check user's role for this club
      const { data: membership, error: membershipError } = await this.supabase
        .from('club_memberships')
        .select('role')
        .eq('user_id', userId)
        .eq('club_id', event.club_id)
        .single();

      if (membershipError || !membership) {
        throw new Error('You are not a member of this club');
      }

      // Check if user is admin or club rep
      const isAdmin = membership.role === 'admin';
      const isClubRep = membership.role === 'club_rep';

      if (!isAdmin && !isClubRep) {
        throw new Error('Only club representatives or admins can update event locations');
      }

      // Update the event location
      const { data, error } = await this.supabase
        .from('events')
        .update({
          location,
        })
        .eq('id', eventId)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update event location');

      return data;
    } catch (error) {
      this.handleError(error, 'eventService.updateEventLocation');
      throw error;
    }
  }

  // Generate QR code for event
  async generateEventQRCode(eventId: number): Promise<string> {
    try {
      // Verify user is club rep/admin for this event
      const userId = await this.getCurrentUserId();

      // Get event details
      const { data: event, error: eventError } = await this.supabase
        .from('events')
        .select('club_id, event_name')
        .eq('id', eventId)
        .single();

      if (eventError || !event) {
        throw new Error('Event not found');
      }

      // Check if user is authorized (club rep or admin)
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
        throw new Error('Only club representatives can generate QR codes');
      }

      // Create QR code data (you can customize what's included)
      const qrData = JSON.stringify({
        eventId,
        type: 'event_checkin',
        clubId: event.club_id,
        timestamp: Date.now(),
      });

      // Frontend will convert the code into image
      return qrData;
    } catch (error) {
      this.handleError(error, 'generateEventQRCode');
      throw error;
    }
  }
}

export const eventService = new EventService();
