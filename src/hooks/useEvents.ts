import { useState, useEffect, useCallback } from 'react';
import { eventService } from '../services/events.service';
import type { Event, EventInsert } from '../services/index';
// ── CHANGED START ──
// Added supabase client import to check session before fetching
import { createBrowserClient } from '@supabase/ssr';
// ── CHANGED END ──

export interface UseEventsOptions {
  autoFetch?: boolean;
}

export interface UseEventsReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  insertClubEvent: (eventData: EventInsert) => Promise<Event>;
  updateClubEvent: (eventData: EventInsert) => Promise<Event>;
  getAllUpcomingClubEvents: () => Promise<Event[]>;
  getClubEvents: (clubId: number, includePast?: false) => Promise<Event[]>;
  getEventById: (eventId: number) => Promise<Event | null>;
  updateEventLatLong: (eventId: number, latitude: number, longitude: number) => Promise<Event>;
  updateEventLocation: (eventId: number, location: string) => Promise<Event>;
}

// ── CHANGED START ──
// Created a supabase client here just to check if a session exists before fetching.
// We are NOT changing BaseService — this is a read-only session check only.
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
// ── CHANGED END ──

export function useEvents(options: UseEventsOptions = {}): UseEventsReturn {
  const { autoFetch = true } = options;

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    // ── CHANGED START ──
    // Added session check — if no user session exists, skip the fetch entirely
    // instead of letting it hit getCurrentUserId() and throw "Unauthorized"
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Not logged in — please sign in to see events.');
      return;
    }
    // ── CHANGED END ──

    try {
      setLoading(true);
      setError(null);
      const data = await eventService.getAllUpcomingClubEvents();
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchEvents();
    }
  }, [fetchEvents, autoFetch]);

  const insertClubEvent = useCallback(
    async (eventData: EventInsert): Promise<Event> => {
      const newEvent = await eventService.insertClubEvent(eventData);
      setEvents((prev) => [...prev, newEvent]);
      return newEvent;
    }, []
  );

  const updateClubEvent = useCallback(
    async (eventData: EventInsert): Promise<Event> => {
      const updated = await eventService.updateClubEvent(eventData);
      setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      return updated;
    }, []
  );

  const getAllUpcomingClubEvents = useCallback(async (): Promise<Event[]> => {
    return eventService.getAllUpcomingClubEvents();
  }, []);

  const getClubEvents = useCallback(
    async (clubId: number, includePast?: false): Promise<Event[]> => {
      return eventService.getClubEvents(clubId, includePast);
    }, []
  );

  const getEventById = useCallback(
    async (eventId: number): Promise<Event | null> => {
      const local = events.find((e) => e.id === eventId);
      return local ?? null;
    }, [events]
  );

  const updateEventLatLong = useCallback(
    async (eventId: number, latitude: number, longitude: number): Promise<Event> => {
      const updated = await eventService.updateEventLatLong(eventId, latitude, longitude);
      setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      return updated;
    }, []
  );

  const updateEventLocation = useCallback(
    async (eventId: number, location: string): Promise<Event> => {
      const updated = await eventService.updateEventLocation(eventId, location);
      setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      return updated;
    }, []
  );

  return {
    events,
    loading,
    error,
    refetch: fetchEvents,
    insertClubEvent,
    updateClubEvent,
    getAllUpcomingClubEvents,
    getClubEvents,
    getEventById,
    updateEventLatLong,
    updateEventLocation,
  };
}
